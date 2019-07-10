import Device from '../models/device';
import BaseCtrl from './base';
import {IDeviceDocument} from '../models/types';

export default class DeviceCtrl extends BaseCtrl<IDeviceDocument> {
  model = Device;
  projection = 'device_id entity_name entity_type';
  listName = 'devices';
}
