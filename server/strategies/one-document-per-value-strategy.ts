import {StorageStrategy} from './storageStrategy';
import {ICachedDevice} from '../models/types';

export class OneDocumentPerValueStrategy extends StorageStrategy{

  documents = [];

  addAttribute = (name, value) => this.documents.push({
    sensorId: this.device.device_id,
    entity_type: this.device.entity_type,
    timestamp: this.timestamp,
    valueName: name,
    value: value
  });

  constructor(public device: ICachedDevice, public timestamp: Date) {
    super();
  }

  getDocuments = () => this.documents;
}
