import {StorageStrategy} from './storageStrategy';
import {ICachedDevice} from '../models/types';

export class OneDocumentPerValueStrategy extends StorageStrategy{

  documents = [];
  device: ICachedDevice;
  timestamp: Date;

  addAttribute = (name, value) => this.documents.push({
    sensorId: this.device.device_id,
    entity_name: this.device.entity_name,
    entity_type: this.device.entity_type,
    timestamp: this.timestamp,
    valueName: name,
    value: value
  });

  build = (device: ICachedDevice, timestamp: Date) => {
    this.device = device;
    this.timestamp = timestamp;
    return this;
  }

  getDocuments = () => this.documents;
}
