import SensorValue from '../models/sensor-value';
import BaseCtrl from './base';
import {IDevice, ISensorValueDocument} from '../models/types';
import Device from '../models/device';
import mongoose from 'mongoose';

interface ICachedDevice {
  device_id: string;
  entity_type: string;
  attributes: {};
}

export default class SensorValueCtrl extends BaseCtrl<ISensorValueDocument> {
  model = SensorValue;
  projection = 'sensorId valueName value';
  listName = 'dummy';
  prefix = process.env.STH_PREFIX;
  parsers = {
    Float: parseFloat,
    Int: parseInt,
    Date: s => new Date(s),
    String: s => s,
    Location: ([alt, lat]) => [parseFloat(alt), parseFloat(lat)]
  }

  cache = {};
  insertCache = (key: string, value: any) => this.cache[key] = value;
  getFromCache = (key: string) => this.cache[key];



  parts2Values = (parts: [string], device: ICachedDevice, timestamp: Date ) => {
    const values = [];
    for (let i = 0; i < parts.length - 1; i += 2) {
      values.push({
        sensorId: device.device_id,
        entity_type: device.entity_type,
        timestamp: timestamp,
        valueName: device.attributes[parts[i]].name,
        value: this.parsers[device.attributes[parts[i]].type](parts[i + 1])
      });
    }
    return values;
  };



  process = async (req, res ) => {
    try {
    const device_id = req.query.i;
    const apikey = req.query.k;
    const parts = req.body.split('|');
    const timestamp = new Date(req.query.t || Date.now());
    if (parts.length === 0 || parts.length % 2 !== 0) {
      res.status(400).send({message: 'malformed payload'})
    } else {
      let device = this.getFromCache(device_id);
      if (!device) {
        const d = await Device.findOne({device_id: device_id});
        device = {
          device_id: d.device_id,
          entity_type: d.entity_type,
          attributes: d.attributes.reduce((acc, a) => {
            acc[a.object_id] = {type: a.type, name: a.name};
            return acc;
          }, {})
        };
        this.insertCache(device_id, device);
      }
      const values = this.parts2Values(parts, device, timestamp);
      const result = await mongoose.connection.collection(this.prefix + apikey + '_' + device.entity_type).insertMany(values);
      res.send({message: 'OK'});
    }
    } catch (err) {
      res.status(500).send(err);
    }
  }
}
