import * as mongoose from 'mongoose';

/*
 The plain Cat entity type completely agnostic of mongoose
*/
export interface ICat {
  name: string,
  weight: number,
  age: number
}

/*
 This interface represents the document (model instance) returned by
 mongoose. It consists of the document properties and all instance methods
 like save(), remove() and so on
 */
export interface ICatDocument extends ICat, mongoose.Document {
  _id: mongoose.Schema.Types.ObjectId;
}

export interface GitHubUser {
  username: string,
  provider: string,
  emails: {
    value: string,
    primary: boolean,
    verified: boolean
  }[]
}


export interface IUser {
  username: string,
  email: string,
  password: string,
  role: string,
  provider: string
}

/*
  Since the User's schema defines a custom instance method
  (with "schema.method.functionName"), we need to declare the type
  of this function here as well, so it can be accessed in the
  rest of the application.
 */
export interface IUserDocument extends IUser, mongoose.Document {
  _id: mongoose.Schema.Types.ObjectId;
  comparePassword: (candidatePassword, callback) => void;
}

/*
 This interface represents the User's model (Model class).
 We need it, since the User's schema defines a custom static
 method, that needs to be declared here as well
 The model interface needs to be registered when creating the
 model from the schema (see ./user.ts for details)
 */
export interface IUserModel extends IUser, mongoose.Model<IUserDocument> {
  findOrCreate: (user: GitHubUser) => Promise<IUserDocument>;
}
