import {IUser, IUserDocument} from '../server/models/types';
import User from '../server/models/user';

import * as jwt from 'jsonwebtoken';


export const range = (size: number): Array<number> =>
  Array.from(new Array(size + 1).keys()).slice(1);

export const createUsers = (number, prefix = 'user', role = 'user'): Array<IUser> =>
  range(number).map(nr => ({
    username: `${prefix}${nr}`,
    email: `${prefix}${nr}@test.com`,
    password: 'topsecret',
    provider: 'local',
    role : role
  }));

export const saveUsers = (users: Array<IUser>): Promise<IUserDocument[]> =>
  Promise.all(users.map(u => new User(u).save()));

export const createAndSaveUsers =
  (number, prefix = 'user', role = 'user'): Promise<IUserDocument[]>  =>
    saveUsers(createUsers(number, prefix, role));

export const getToken = (user: IUser) => jwt.sign({ user: user }, process.env.SECRET_TOKEN);
