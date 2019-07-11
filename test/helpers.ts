import {IUser, IUserDocument} from '../server/models/types';
import User from '../server/models/user';

import * as jwt from 'jsonwebtoken';
import Device from '../server/models/device';
import Group from '../server/models/group';


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

export const createDevices = (number) =>
  range(number).map(nr => ({
    'device_id': `test_device_${nr}`,
    'entity_name': `TestSensor${nr}`,
    'entity_type': 'test_sensor',
    'timezone': 'Europe/Vienna',
    'attributes': [
      {
        'object_id': 't',
        'name': 'temperature',
        'type': 'Float'
      },
      {
        'object_id': 'h',
        'name': 'humidity',
        'type': 'Float'
      },
      {
        'object_id': 'pm25',
        'name': 'pm25',
        'type': 'Int'
      },
      {
        'object_id': 'pm10',
        'name': 'pm10',
        'type': 'Int'
      },
      {
        'object_id': 'ap',
        'name': 'airPressure',
        'type': 'Float'
      },
      {
        'object_id': 't2',
        'name': 'mangOHTemp',
        'type': 'Float'
      },
      {
        'object_id': 's',
        'name': 'status',
        'type': 'String'
      },
      {
        'object_id': 'l',
        'name': 'location',
        'type': 'Location'
      },
      {
        'object_id': 'ap2',
        'name': 'mangOHPress',
        'type': 'Float'
      }
    ]
  }));

export const storeDevices = (nr) => Device.insertMany(createDevices(nr));

export const createGroups = (number) =>
  range(number).map(nr => ({
    'apikey': `apiperftest_${nr}`,
    'token': 'token2',
    'entity_type': 'test_sensor_${nr}',
    'resource': '/iot/d'
  }));


export const storeGroups = (nr) => Group.insertMany(createGroups(nr));
