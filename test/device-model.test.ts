import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({path: '.env.test'});
import Device from '../server/models/device';
import {IDeviceDocument} from '../server/models/types';


mongoose.connect(process.env.MONGODB_URI,  { useNewUrlParser: true } );
const db = mongoose.connection;
(<any>mongoose).Promise = global.Promise;


const clearDB = () => Promise.all([Device.deleteMany({})]);

afterAll(async () => await clearDB());

beforeEach(async () => await clearDB());

describe('User Schema', () => {
  it('should not allow to create empty users', (done) => {
    const sensorValue = {};
    new Device(sensorValue).save().then(() => done('Empty SensorValues\'s are not allowed to be stored'))
      .catch(err => {
        const errors = err.errors;
        expect(errors.device_id).toBeDefined();
        expect(errors.device_id.kind).toBe('required');
        expect(errors.entity_name).toBeDefined();
        expect(errors.entity_name.kind).toBe('required');
        done();
      });
  });

  it('should allow sensor values to be created', async () => {
    const device = {
      device_id: 'test-sensor1',
      entity_name : 'TestSensor1',
      entity_type: 'test_sensor',
      timezone: 'Europe/Vienna',
      attributes: [
        {
          object_id: 't',
          name: 'temperature',
          type: 'Float'
        },
        {
          object_id: 'h',
          name: 'humidity',
          type: 'Float'
        },
      ]
    };
    const value: IDeviceDocument = await new Device(device).save();
    expect(value._id).toBeDefined();
    expect(value.device_id).toEqual(device.device_id);
    expect(value.entity_name).toEqual(device.entity_name);
    expect(value.attributes).toHaveLength(2);
  });
});
