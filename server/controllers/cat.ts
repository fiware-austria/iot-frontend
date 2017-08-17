import Cat from '../models/cat';
import BaseCtrl from './base';
import {ICatDocument} from '../models/types';

export default class CatCtrl extends BaseCtrl<ICatDocument> {
  model = Cat;
  projection = 'name';
}
