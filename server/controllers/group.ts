import BaseCtrl from './base';
import {IGroupDocument} from '../models/types';
import Group from '../models/group';

export default class GroupCtrl extends BaseCtrl<IGroupDocument> {
  model = Group;
  projection = 'device_id entity_name entity_type';
  listName = 'services';
}
