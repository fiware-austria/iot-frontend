import mongoose, {Schema} from 'mongoose';
import {ISensorValueDocument} from './types';


const sensorValueSchema = new mongoose.Schema({
  sensorId: {type: mongoose.Schema.Types.String, required: true},
  valueName: {type: mongoose.Schema.Types.String, required: true},
  value: { type: mongoose.Schema.Types.Mixed},
  timestamp: { type: mongoose.Schema.Types.Date, required: true, default: Date.now()}
});

const SensorValue = mongoose.model<ISensorValueDocument>('SensorValue', sensorValueSchema);

export default SensorValue;
