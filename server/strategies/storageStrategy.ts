import {ICachedDevice} from '../models/types';

export abstract class StorageStrategy {



  abstract addAttribute: (name: string, value: any) => void;
  abstract getDocuments: () => Object[];
  abstract build: (device: ICachedDevice, timestamp: Date) => StorageStrategy;
}
