import BaseCtrl from './base';
import {IGroupDocument} from '../models/types';
import Group from '../models/group';

export default class GroupCtrl extends BaseCtrl<IGroupDocument> {
  model = Group;
  projection = 'device_id entity_name entity_type';
  listName = 'services';

  load = (req, res, next, id) =>
    this.model.findOne({apikey: id})
      .then(m => (this.model.hasOwnProperty('load')) ? this.model['load'](m._id) : m)
      .then(m => {
        if (m == null) {throw new Error('Element not found')};
        req[this.model.collection.collectionName] = m})
      .then(() => next())
      .catch(err => res.status(500).json({message: `Could not load this element (${err})`}));

}
