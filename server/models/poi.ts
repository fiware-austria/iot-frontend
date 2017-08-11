import * as mongoose from 'mongoose';

const poiSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  loc: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  creator: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }/*,

  images: [
    {
      id: Schema.Types.ObjectId,
      description: String,
      uploaded: {
        type: Date,
        "default": Date.now
      },
      user: String
    }
  ]*/
});

poiSchema.index({
  loc: '2dsphere'
});



poiSchema.statics.load = function(id) {
  return this.findOne({
    _id: id
  }).populate('creator', 'local.username');
};

export default mongoose.model('POI', poiSchema);
