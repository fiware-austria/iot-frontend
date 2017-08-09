import * as mongoose from 'mongoose';

export interface GitHubUser {
  username: string,
  provider: string,
  emails: [{
    value: string,
    primary: boolean,
    verified: boolean
  }]
}

export interface IUser {
  username: string,
  email: string,
  password: string,
  role: string,
  provider: string
}

export interface IUserModel extends IUser, mongoose.Document { }


