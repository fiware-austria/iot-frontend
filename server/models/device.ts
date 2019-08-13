import mongoose, {Schema} from 'mongoose';
import {IDeviceDocument} from './types';


const deviceFieldSchema = new mongoose.Schema({
  object_id: {type: mongoose.Schema.Types.String, required: true},
  name: {type: mongoose.Schema.Types.String, required: true},
  type: {type: mongoose.Schema.Types.String, required: true}
});

const deviceSchema = new mongoose.Schema({
  service: {type: mongoose.Schema.Types.String, required: true},
  device_id: {type: mongoose.Schema.Types.String, required: true },
  entity_name: {type: mongoose.Schema.Types.String, required: true},
  entity_type: { type: mongoose.Schema.Types.Mixed},
  timezone: { type: mongoose.Schema.Types.String, required: false},
  attributes: [deviceFieldSchema]
});

deviceSchema.index({device_id: 1, service: 1}, {unique: true});

const Device = mongoose.model<IDeviceDocument>('Device', deviceSchema);

export default Device;
