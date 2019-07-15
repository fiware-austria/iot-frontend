import {ICachedDevice} from '../models/types';

export abstract class StorageStrategy {


  // TODO: refactor to builder pattern
  abstract addAttribute: (name: string, value: any) => void;
  abstract getDocuments: () => Object[];
}
