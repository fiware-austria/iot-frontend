import * as mongoose from 'mongoose';


export interface ICat {
  name: string,
  weight: number,
  age: number
}

export interface ICatDocument extends ICat, mongoose.Document {}

export interface GitHubUser {
  username: string,
  provider: string,
  emails: [{
    value: string,
    primary: boolean,
    verified: boolean
  }]
}

export interface LoadableDocument<T extends mongoose.Document> {
  load: (id: mongoose.Schema.Types.ObjectId) => Promise<T>;
}

export interface IUser {
  username: string,
  email: string,
  password: string,
  role: string,
  provider: string
}

export interface IUserDocument extends IUser, mongoose.Document {
  _id: mongoose.Schema.Types.ObjectId;
  comparePassword: (candidatePassword, callback) => void;
}


export interface IUserModel extends IUser, mongoose.Model<IUserDocument> {
  findOrCreate: (user: GitHubUser) => Promise<IUserDocument>;
}
