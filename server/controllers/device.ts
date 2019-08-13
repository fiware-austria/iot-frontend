import Device from '../models/device';
import BaseCtrl from './base';
import {IDeviceDocument} from '../models/types';
import {Request} from 'express';

export default class DeviceCtrl extends BaseCtrl<IDeviceDocument> {
  model = Device;
  projection = 'device_id entity_name entity_type';
  listName = 'devices';

  ensureServiceHeader = (req, res, next) => {
    if (!('fiware-service' in req.headers)) {
      res.status(400).send({message: 'Header field \'fiware-service\' is required in request'})
    }
    const service = req.headers['fiware-service'];
    req.body.service = service;
    if (this.listName in req.body) {
      req.body[this.listName].forEach(el => el.service = service);
    }
    next();
  }


  getList = (req, res) =>
    this.model.find({service: req.body.service}, this.projection)
      .then(l => res.json(l))
      .catch(err => res.status(500).json({message: err}));

  getAll = (req: Request, res) => {
    this.model.find({service: req.headers['fiware-service']}, (err, docs) => {
      if (err) { return console.error(err); }
      res.json(docs);
    });
  };

  load = (req, res, next, id) =>
    this.model.findOne({device_id: id, service: req.headers['fiware-service']})
      .then(m => (this.model.hasOwnProperty('load')) ? this.model['load'](m._id) : m)
      .then(m => {
        if (m == null) {throw new Error('Element not found')};
        req[this.model.collection.collectionName] = m})
      .then(() => next())
      .catch(err => res.status(500).json({message: `Could not load this element (${err})`}));

}
