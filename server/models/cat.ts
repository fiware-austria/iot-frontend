import mongoose from 'mongoose';
import {ICatDocument} from './types';

const catSchema = new mongoose.Schema({
  name: String,
  weight: Number,
  age: Number
});

const Cat = mongoose.model<ICatDocument>('Cat', catSchema);

export default Cat;
