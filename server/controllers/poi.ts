import BaseCtrl from './base';
import POI from '../models/poi';
import {IPOIDocument } from '../models/types';


export default class POICtrl extends BaseCtrl<IPOIDocument> {
  model = POI;
  projection: '_id, name, creator, createdAt';

  insert = (req, res) => {
    const obj = new this.model(req.body);
    obj.creator = req.user._id;
    obj.save().then(m => res.json(m))
      .catch(err => res.status(err.code === 11000 ? 400 : 500).json({message: err}));
  }

  updatePOI = (req, res) => {
    req.body.creator = req.user._id;
    req.body.loc.type = 'Point';
    this.update(req, res);
  }
}
