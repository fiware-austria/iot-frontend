import BaseCtrl from './base';
import {IGroupDocument} from '../models/types';
import Group from '../models/group';
import mongoose from 'mongoose';
import {catTrans} from '../config';

export default class GroupCtrl extends BaseCtrl<IGroupDocument> {
  model = Group;
  projection = 'device_id entity_name entity_type';
  listName = 'services';

  load = (req, res, next, id) =>
    this.model.findOne({apikey: id, service: req.headers['fiware-service']})
      .then(m => (this.model.hasOwnProperty('load')) ? this.model['load'](m._id) : m)
      .then(m => {
        if (m == null) {
          throw new Error('Element not found')
        }
        ;
        req[this.model.collection.collectionName] = m
      })
      .then(() => next())
      .catch(err => res.status(500).json({message: `Could not load this element (${err})`}));

  extractService = (req, res, next) => {
    if (!('fiware-service' in req.headers)) {
      res.status(400).send({message: 'Header field \'fiware-service\' is required in request'})
    }
    const service = req.headers['fiware-service'];
    req.body.service = service;
    if ('services' in req.body) {
      req.body.services.forEach(svc => svc.service = service);
    }
    next();
  }

  getList = (req, res) =>
    this.model.find({service: req.body.service}, this.projection)
      .then(l => res.json(l))
      .catch(err => res.status(500).json({message: err}));

  createIndex = (req, res, next) => {
    try {
      const prefix = process.env.STH_PREFIX;
      const collectionName = (type: string) => prefix + '_' + req.body.service + '_' + type;
      const db = mongoose.connection;
      Promise.all(req.body.services.map(svc => {
        const colName = collectionName(svc.entity_type);
        catTrans.info(`Trying to create collection ${colName}`);
        return db.createCollection(collectionName(svc.entity_type))
        .then(col => {
          catTrans.debug('Successfully created collection: ' + col.collectionName);
          return col.createIndexes([
            {name: '_entity_name', key: {'entity_name': 1}, background: true},
            {name: '_entity_name_timestamp', key: {'entity_name': 1, 'timestamp': -1}, background: true}
          ])
        })
        .then(ok => {
          return catTrans.info('Created indexes for collection ' + collectionName);
        }).catch(err => {
          return catTrans.error('Could not create indexes for collection ' + collectionName, err);
        })})).then(() => next())
        .catch(err => {
            catTrans.error('Error', err);
            res.status(500).send({message: 'Could not create index'})
          }
        );

    } catch (err) {
      catTrans.error('Error while creating collection/indexes', err);
      res.status(505).send({message: 'Error gschissena'})
    }
  }

}
