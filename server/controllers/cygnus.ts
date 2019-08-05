import {OneDocumentPerValueStrategy} from '../strategies/one-document-per-value-strategy';
import {OneDocumentPerTransactionStrategy} from '../strategies/one-document-per-transaction-strategy';
import {StorageStrategy} from '../strategies/storageStrategy';
import {catSystem, catTrans} from '../config';
import superagent from 'superagent';
import {Request, Response} from 'express';
import {Attribute, CygnusNotifyRequest, ICachedDevice} from '../models/types';
import mongoose from "mongoose";

export default class CygnusCtrl {

  prefix = process.env.STH_PREFIX;
  parsers = {
    Float: parseFloat,
    Int: parseInt,
    Integer: parseInt,
    Date: s => new Date(s),
    String: s => s,
    Location: s => ({type: 'Point', coordinates: s.split(',').map(parseFloat).reverse()}),
    'geo:point': s => ({type: 'Point', coordinates: s.split(',').map(parseFloat).reverse()})
  };
  storageStrategies = {
    ONE_DOCUMENT_PER_VALUE: OneDocumentPerValueStrategy,
    ONE_DOCUMENT_PER_TRANSACTION: OneDocumentPerTransactionStrategy
  };

  constructor() {}

  getTimeStamp = (a: Attribute) => {
    let timestamp = new Date();
    if (a.metadata) {
      const timeInstant = a.metadata.find(m => m.type === 'ISO8601');
      if (timeInstant) {
        timestamp = timeInstant.value;
      }
    }
    return timestamp;
  }


  parseRequest = (elem: CygnusNotifyRequest, tenant: string) => Promise.all(
    elem.contextResponses.map(ctxResp => {
      const virtualDevice: ICachedDevice = {
          device_id: 'cygnus_dev',
          entity_type: ctxResp.contextElement.type,
          entity_name: ctxResp.contextElement.id,
          attributes: ctxResp.contextElement.attributes
      }
      try {
        const timestamp = this.getTimeStamp(ctxResp.contextElement.attributes[0])
        const strategy: StorageStrategy = new this.storageStrategies[process.env.STORAGE_STRATEGY]().build(virtualDevice,
          timestamp);
        ctxResp.contextElement.attributes.forEach(att => strategy.addAttribute(att.name, this.parsers[att.type](att.value)))
        return mongoose.connection.collection(this.prefix + '_' + tenant + '_' + virtualDevice.entity_type)
          .insertMany(strategy.getDocuments());
      } catch (err) {
          const msg = 'Parsing your request failed. Make sure that all attributes have a valid type! \n' +
            `Supported types are: ${Object.keys(this.parsers)}`
          catSystem.error(msg, err)
          return  Promise.reject(new Error(msg));
      }
    })
  )


   process = async (req: Request, res: Response) => {
     const servicePath = req.headers['fiware-servicepath'];
     const service = req.headers['fiware-service'];
     if (!service || !servicePath) {
       res.status(400).send('"Fiware-Service" and "FIWARE-Servicepath" headers are required!');
       return;
     }
     this.parseRequest(req.body, service.toString())
       .then(result => res.send({message: 'OK'}))
       .catch(err => res.status(400).send({ message: (err.message || err)}))
   }


}
