import mongoose from 'mongoose';
import {IGroupDocument} from './types';

const groupSchema = new mongoose.Schema({
  apikey: { type: mongoose.Schema.Types.String, required: true },
  token: { type: mongoose.Schema.Types.String, required: false },
  entity_type: { type: mongoose.Schema.Types.String, required: true },
  resource: { type: mongoose.Schema.Types.String, required: true },
});

groupSchema.index({apikey: 1});

const Group = mongoose.model<IGroupDocument>('Group', groupSchema);

export default Group;
