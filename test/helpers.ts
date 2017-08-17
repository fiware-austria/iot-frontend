import {IPOI, IPOIDocument, IUser, IUserDocument} from '../server/models/types';
import User from '../server/models/user';
import POI from '../server/models/poi';
import * as jwt from 'jsonwebtoken';


export const range = (size: number): Array<number> => {
  const result = Array<number>(size);
  for (let i = 0; i < size; i += 1) {
    result[i] = i + 1;
  }
  return result;
};

export const createUsers = (number, prefix = 'user', role = 'user'): Array<IUser> =>
  range(number).map(nr => ({
    username: `${prefix}${nr}`,
    email: `${prefix}${nr}@test.com`,
    password: 'topsecret',
    provider: 'local',
    role : role
  }));

export const saveUsers = (users: Array<IUser>): Promise<[IUserDocument]> =>
  Promise.all(users.map(u => new User(u).save()));

export const createAndSaveUsers =
  (number, prefix = 'user', role = 'user'): Promise<[IUserDocument]>  =>
    saveUsers(createUsers(number, prefix, role));

export const createPOIs = (number: number, creator: IUserDocument, prefix = 'poi'): Array<IPOI> =>
  range(number).map(nr => ({
    name: `${prefix}-${creator.username}-${nr}`,
    description: `${prefix}-${creator.username}-${nr} description`,
    creator: creator._id,
    loc: { coordinates: [nr, nr]}
  }));

export const savePOIs = (pois: Array<IPOI>): Promise<[IPOIDocument]> =>
  Promise.all(pois.map(p => new POI(p).save()));

export const createAndSavePOIs = (number: number, creator: IUserDocument, prefix = 'poi') =>
  savePOIs(createPOIs(number, creator, prefix));

export const getToken = (user: IUser) => jwt.sign({ user: user }, process.env.SECRET_TOKEN);
