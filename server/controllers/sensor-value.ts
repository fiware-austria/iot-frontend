import SensorValue from '../models/sensor-value';
import BaseCtrl from './base';
import {ICachedDevice, IDevice, ISensorValueDocument} from '../models/types';
import Device from '../models/device';
import mongoose from 'mongoose';
import {OneDocumentPerValueStrategy} from '../strategies/one-document-per-value-strategy';
import {OneDocumentPerTransactionStrategy} from '../strategies/one-document-per-transaction-strategy';
import {StorageStrategy} from '../strategies/storageStrategy';
import {catTrans} from '../config';
import superagent from 'superagent';
import {parsers} from './parsers';

// TODO refactor to store different tenants in different databases

export default class SensorValueCtrl {

  prefix = process.env.STH_PREFIX;
  orionEnabled = false;
  orionUpdateInterval = 0;
  chunkSize = 100;

  cache = {};
  orionCache = {};
  storageStrategies = {
    ONE_DOCUMENT_PER_VALUE: OneDocumentPerValueStrategy,
    ONE_DOCUMENT_PER_TRANSACTION: OneDocumentPerTransactionStrategy
  };
  orionStates = {
    STOPPED: 0,
    IS_SCHEDULED: 1,
    RUNNING: 2,
    NEEDS_RUNNING: 3
  };
  orionState = this.orionStates.STOPPED;

  startOrion = () => {
    catTrans.debug('Starting ORION update process');
    setTimeout(this.sendOrion, this.orionUpdateInterval);
    this.orionState = this.orionStates.IS_SCHEDULED;
  }

  constructor() {
    this.orionEnabled = process.env.ORION_ENABLED === 'true';
    if (this.orionEnabled) {
      catTrans.info('ORION is enabled')
      this.orionUpdateInterval = parseInt(process.env.ORION_UPDATE_INTERVAL, 10) * 1000;
      catTrans.info(`ORION update interval set to ${this.orionUpdateInterval}ms`);
      this.chunkSize = parseInt(process.env.ORION_CHUNKSIZE || '100', 10);
      catTrans.info(`ORION chunk size set to ${this.chunkSize} entities per request`)
    } else {
      catTrans.warn('ORION is not enabled!')
    }
  }

  insertCache = (key: string, service: string, value: any) => this.cache[`${key}_${service}`] = value;

  getFromCache = (key: string, service: string) => this.cache[`${key}_${service}`];

  /*
    Parses the incoming ultralight message and converts it into documents that
    will later be stored to mongo
   */
  parseUltralight = (parts: any, device: ICachedDevice, timestamp: Date, service: string) => {
    const strategy: StorageStrategy = new this.storageStrategies[process.env.STORAGE_STRATEGY]().build(device, timestamp);
    let hasLocation = false;
    const entity = {
      type: device.entity_type,
      id: device.entity_name
    };
    try {
      for (let i = 0; i < parts.length - 1; i += 2) {
        if (device.attributes[parts[i]].type === 'geo:point') {
          hasLocation = true;
        }
        const name = device.attributes[parts[i]].name;
        const type = device.attributes[parts[i]].type;
        const value = parsers[type.toLowerCase()](parts[i + 1]);
        strategy.addAttribute(name, value);
        entity[name] = {value: value, type: type};
      }
    } catch (err) {
      throw new Error('Your sensor is using an attribute that is not configured. Configured attributes are: ' +
        JSON.stringify(device.attributes))
    }

    if (this.orionEnabled) {
      const orionEntity = hasLocation ? Object.assign({}, entity) : entity;
      if (hasLocation) {
        // Orion requires an array of [lat,alt] for type geo:point, whereas Mongo needs geo:json
        Object.entries(orionEntity).filter(([k, v]) => v['type'] === 'geo:point')
          .forEach(([k, v ]) => orionEntity[k] = { value: `${v['value'].coordinates[1]},${v['value'].coordinates[0]}`, type: 'geo:point'});
      }
      catTrans.debug('Adding entity to orionCache: ' + JSON.stringify(orionEntity));
      this.orionCache[service].entities[entity.type + '___' + entity.id] = orionEntity;
    }
    return strategy.getDocuments();
  };

  prepareOrionCache = (tenant: string, servicePath: string) => {
    if (!this.orionCache.hasOwnProperty(tenant)) {
      this.orionCache[tenant] = {
        entities: {},
        servicePath: servicePath
      }
    }
  };


  nextStep = () => {
    catTrans.debug('deciding about next step. Current state: ' + this.orionState);
    switch (this.orionState) {
      case this.orionStates.RUNNING:
        catTrans.debug('Stopping ORION update process');
        this.orionState = this.orionStates.STOPPED;
        break;
      case this.orionStates.NEEDS_RUNNING:
        this.startOrion();
        break;
    }
  }

  /*
    Sends the current content of orionCache to Orion using a batch update request
   */
  sendOrion = () => {
    this.orionState = this.orionStates.RUNNING;
    catTrans.debug('Clearing orionCache and start transmission to ORION');
    const batch = this.orionCache;
    this.orionCache = {};
    for (const [service, entities] of Object.entries(batch)) {
      catTrans.debug('Sending to service: ' + service);
      this.sendOrionBatch(service, entities).then(this.nextStep)
      // TODO: this won't work for multiple tenants!
    }
  };


  // Split up a list into a list of smaller chunks of a given size
  toChunks = (size: number, batch: {}[]) => {
    const result = [];
    for (let start = 0; start < batch.length; start += size) {
      result.push(batch.slice(start, start + size));
    }
    return result;
  };

  sendOrionBatch = (service: string, entities) => {
    const payload = Object.values(entities['entities']);
    catTrans.debug('Entities: ' + JSON.stringify(payload));
    return this.toChunks(this.chunkSize, payload).reduce((promise, chunk) =>
      promise.then(() => superagent.post(process.env.ORION_ENDPOINT + '/v2/op/update')
        .set('fiware-service', service)
        .set('fiware-servicepath', entities['servicePath'])
        .send({actionType: 'append', entities: chunk})), Promise.resolve())
      .then(r => catTrans.info('Successfully transmitted data to ORION'))
      .catch(err => catTrans.error('Error while transmitting data to ORION', err))
  }


  process = async (req, res) => {
    try {
      const servicePath = req.headers['fiware-servicepath'];
      const service = req.headers['fiware-service'];
      if (!service || !servicePath) {
        res.status(400).send('"Fiware-Service" and "FIWARE-Servicepath" headers are required!');
        return;
      }

      const device_id = req.query.i;
      const apikey = req.query.k;
      const parts = req.body.split('|');
      const timestamp = new Date(req.query.t || Date.now());
      if (parts.length === 0 || parts.length % 2 !== 0) {
        res.status(400).send({message: 'malformed payload'})
      } else {
        let device = this.getFromCache(device_id, service);
        if (!device) {
          const d = await Device.findOne({device_id: device_id, service: service});
          if (d == null) {
            throw Error(`There is no device configuration for device '${device_id}'`);
          }
          device = {
            device_id: d.device_id,
            service: service,
            entity_type: d.entity_type,
            entity_name: d.entity_name,
            attributes: d.attributes.reduce((acc, a) => {
              acc[a.object_id] = {type: a.type, name: a.name};
              return acc;
            }, {})
          };
          this.insertCache(device_id, service, device);
        }
        this.prepareOrionCache(service, servicePath);
        const values = this.parseUltralight(parts, device, timestamp, service);
        if (this.orionEnabled) {
          switch (this.orionState) {
            case this.orionStates.STOPPED:
              this.startOrion();
              break;
            case this.orionStates.RUNNING:
              this.orionState = this.orionStates.NEEDS_RUNNING;
              break;
          }
        }
        const result = await mongoose.connection.collection(this.prefix + '_' + service + '_' + device.entity_type).insertMany(values);
        res.send({message: 'OK'});
      }
    } catch (err) {
      catTrans.error('Could not process sensor value', err);
      res.status(500).send({message: (err.message || JSON.stringify(err))});
    }
  }
}

