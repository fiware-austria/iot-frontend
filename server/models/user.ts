import * as bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {GitHubUser, IUser, IUserDocument} from './types';
import Email from 'mongoose-type-email';
import {IUserModel} from './types';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: Email, unique: true, lowercase: true, trim: true, required: true },
  password: String,
  role: {type: String, enum: ['user', 'admin'], required: true},
  provider: {type: String, required: true}
});

// Before saving the user, hash the password
userSchema.pre<IUserDocument>('save', function(next) {
  const user = this;
  if (!user.isModified('password')) { return next(); }
  bcrypt.genSalt(10, function(err, salt) {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, function(error, hash) {
      if (error) { return next(error); }
      user.password = hash;
      next();
    });
  });
});


userSchema.statics.findOrCreate = function(user: GitHubUser): IUserDocument {
  const email = user.emails.find(m => m.primary).value;
  const self = this;
  return this.findOne({email: email})
    .then((result) => result || self.create({
      username: user.username,
      provider: user.provider,
      email: email,
      role: 'user'
    }))

};


userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) { return callback(err); }
    callback(null, isMatch);
  });
};

// Omit the password when returning a user
userSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    delete ret.password;
    return ret;
  }
});

const User: IUserModel = mongoose.model<IUserDocument, IUserModel>('User', userSchema);

export default User;
