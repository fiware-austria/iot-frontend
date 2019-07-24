import {StorageStrategy} from './storageStrategy';
import {ICachedDevice} from '../models/types';

export interface ITransactionDocument {
  sensorId: string,
  timestamp: Date,
  entity_type: string,
}

export class OneDocumentPerTransactionStrategy extends StorageStrategy {

  documents = {};

  build = (device: ICachedDevice, timestamp: Date) => {
    this.documents['sensorId'] = device.device_id;
    this.documents['timestamp'] = timestamp;
    this.documents['entity_type'] = device.entity_type;
    this.documents['entity_name'] = device.entity_name;
    return this;
  }

  addAttribute = (name, value) => {
    this.documents[name] = value;
  };

  getDocuments = () => [this.documents];
}
