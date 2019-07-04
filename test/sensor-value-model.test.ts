import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({path: '.env.test'});
import * as bcrypt from 'bcryptjs';
import {GitHubUser, ISensorValueDocument} from '../server/models/types';
import SensorValue from '../server/models/sensor-value';
import User from '../server/models/user';

mongoose.connect(process.env.MONGODB_URI,  { useNewUrlParser: true } );
const db = mongoose.connection;
(<any>mongoose).Promise = global.Promise;


const clearDB = () => Promise.all([SensorValue.deleteMany({})]);

afterAll(async () => await clearDB());

beforeEach(async () => await clearDB());

describe('User Schema', () => {
  it('should not allow to create empty users', (done) => {
    const sensorValue = {};
    new SensorValue(sensorValue).save().then(() => done('Empty SensorValues\'s are not allowed to be stored'))
      .catch(err => {
        const errors = err.errors;
        expect(errors.sensorId).toBeDefined();
        expect(errors.sensorId.kind).toBe('required');
        expect(errors.valueName).toBeDefined();
        expect(errors.valueName.kind).toBe('required');
        done();
      });
  });
  it('should allow sensor values to be created', async () => {
    const sensorValue = {
      sensorId: 'test-sensor',
      valueName : 'temperature',
      value: 23.8
    };
    const value: ISensorValueDocument = await new SensorValue(sensorValue).save();
    expect(value._id).toBeDefined();
    expect(value.valueName).toEqual(sensorValue.valueName);
    expect(value.value).toEqual(23.8);
    expect(value.timestamp).toBeDefined();
  });
});
