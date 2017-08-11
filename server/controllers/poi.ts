import BaseCtrl from './base';
import POI from '../models/poi';


export default class POICtrl extends BaseCtrl {
  model = POI;
  projection: '_id, name, creator, createdAt';
}
