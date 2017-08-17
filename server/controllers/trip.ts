import BaseCtrl from './base';
import Trip from '../models/trip';
import {ITripDocument} from '../models/types';


export default class TripCtrl extends BaseCtrl<ITripDocument> {
  model = Trip;
  projection: '_id, name, description, createdAt';

  preserveOwnerShip = (req, res, next) => {
    req.body.creator = req.user._id;
    next();
  }
}
