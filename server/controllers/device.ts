import Device from '../models/device';
import BaseCtrl from './base';
import {IDeviceDocument} from '../models/types';

export default class DeviceCtrl extends BaseCtrl<IDeviceDocument> {
  model = Device;
  projection = 'device_id entity_name entity_type';
  listName = 'devices';

  load = (req, res, next, id) =>
    this.model.findOne({device_id: id})
      .then(m => (this.model.hasOwnProperty('load')) ? this.model['load'](m._id) : m)
      .then(m => {
        if (m == null) {throw new Error('Element not found')};
        req[this.model.collection.collectionName] = m})
      .then(() => next())
      .catch(err => res.status(500).json({message: `Could not load this element (${err})`}));

}
