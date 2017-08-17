import * as mongoose from 'mongoose';
import {ITripDocument, ITripModel} from './types';

const tripSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  begin: Date,
  end: Date,
  createdAt: {
    type: Date,
    'default': Date.now
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  pois: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'POI'
    }
  ]
});



tripSchema.statics.load = function(id: mongoose.Schema.Types.ObjectId) {
  return this.findById(id).populate('creator', 'username').populate('pois');
};

export default mongoose.model<ITripDocument, ITripModel>('Trip', tripSchema);
