import {StorageStrategy} from './storageStrategy';
import {ICachedDevice} from '../models/types';

export interface ITransactionDocument {
  sensorId: string,
  timestamp: Date,
  entity_type: string,
}

export class OneDocumentPerTransactionStrategy extends StorageStrategy {

  documents = {};

  constructor(public device: ICachedDevice, public timestamp: Date) {
    super();
    this.documents['sensorId'] = this.device.device_id;
    this.documents['timestamp'] = this.timestamp;
    this.documents['entity_type'] = this.device.entity_type;
  }

  addAttribute = (name, value) => {
    this.documents[name] = value;
  };

  getDocuments = () => [this.documents];
}
