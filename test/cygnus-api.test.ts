import supertest from 'supertest';
import dotenv from 'dotenv';

dotenv.config({path: '.env.test'});
import mongoose from 'mongoose';
import {app} from '../server/app';
import SensorValue from '../server/models/sensor-value';


// import * as Bluebird from 'bluebird';
import {createUsers, range, saveUsers, getToken, storeGroups, storeDevices} from './helpers';
import User from '../server/models/user';
import Device from '../server/models/device';
import Group from '../server/models/group';
import {IDevice, IDeviceDocument} from '../server/models/types';
import device from '../server/controllers/device';
import {sample} from 'rxjs/operators';


// (<any>mongoose).Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});
const db = mongoose.connection;

const tenant = 'test_tenant';
const entity_type = 'test_sensor';
const sensor_collection_name = process.env.STH_PREFIX + '_' + tenant + '_' + entity_type;

const randomValue = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100
const delay = ms => new Promise(res => setTimeout(res, ms));

const sensor_attributes = [
  {'name': 'temperature', 'type': 'Float', value: () => randomValue(-10, 39)},
  {'name': 'humidity', 'type': 'Float', value: () => randomValue(0, 100)},
  {'name': 'pm25', 'type': 'Float', value: () => randomValue(0, 90)},
  {'name': 'pm10', 'type': 'Float', value: () => randomValue(0, 90)},
  {'name': 'airPressure', 'type': 'Float', value: () => randomValue(920, 1100)},
  {'name': 'status', 'type': 'String', value: () => 'OK'},
  {'name': 'location', 'type': 'geo:point', value: () =>
      `${47 + randomValue(-5, 5)},${15 + randomValue(-5, 5)}`},
];

const createSensorValues = (number: number, devices: IDeviceDocument[],
                            attributes = sensor_attributes,
                            apiKey = 'apiperftest_1') => {
  const result = [];
  const now = new Date();
  range(number).forEach(nr =>
    result.push(devices.map(d => ({
      device_id: d.device_id,
      apiKey: apiKey,
      payload: {
        subcriptionId: '123',
        originator: 'localhost',
        contextResponses: [
          { contextElement: {
              type: d.entity_type,
              isPattern: false,
              id: d.entity_name,
              attributes: attributes.map(a => ({
                name: a.name,
                type: a.type,
                value: a.value(),
                metadata: [{
                  name: 'TimeInstant',
                  type: 'ISO8601',
                  value: now
                }]
              }))
            },
            statusCode: {
              code: 200,
              reasonPhrase: 'OK'
            }
          }
        ]
      }
    })))
  );
  return result;
}


const clearDB = () => Promise.all([
  db.collection(sensor_collection_name).deleteMany({}),
  User.deleteMany({}),
  Device.deleteMany({}),
  Group.deleteMany({})
]);


beforeEach(async () => await clearDB());

afterAll(async () => await clearDB());

const checkEntity = (entity: {}, sample: {}, ignore = ['_id', 'timestamp', 'sensorId', 'entity_type', 'entity_name']) => {
  console.log('Checking entity: ' + entity['_id'].id);
  Object.entries(sample).forEach(([key, value]) => {
      if (!ignore.includes(key)) {
        console.log('Testing property: ' + key);
        expect(entity['attrs'][key].value).toEqual(value)
      }
    }
  );
}



const createRequest = data =>
  supertest(app)
    .post(`/iot/d?i=${data.device_id}&k=${data.apiKey}`)
    // .set('Authorization', `Bearer ${getToken(savedUser[0])}`)
    .set('Fiware-Service', tenant)
    .set('Fiware-ServicePath', '/')
    .type('text')
    .send(data.payload);

const transmitSamples = (deviceGroups: [][]): Promise<any> =>
  deviceGroups.reduce((promise, group) =>
    promise.then(() => Promise.all(group.map(createRequest)).then(() => delay(100)) ), Promise.resolve())

describe('POST /notify', () => {
  it('should create a new Sensor samples (ONE_DOCUMENT_PER_VALUE)', async () => {
    // console.log(`Using token: ${userJWT}`);
    process.env.STORAGE_STRATEGY = 'ONE_DOCUMENT_PER_VALUE';
    const [groups, devices] = await Promise.all([storeGroups(1), storeDevices(1)]);
    const samples = createSensorValues(1, devices);
    const collectionName = process.env.STH_PREFIX  + '_' + tenant + '_' + devices[0].entity_type;
    await mongoose.connection.collection(collectionName).deleteMany({});
    const savedUser = await saveUsers(createUsers(1, 'sensor'));
    const sensorResponse = await supertest(app)
      .post(`/notify`)
      .set('Authorization', `Bearer ${getToken(savedUser[0])}`)
      .set('Fiware-Service', tenant)
      .set('Fiware-ServicePath', '/')
      .send(samples[0][0].payload);
    expect(sensorResponse.status).toEqual(200);
    const storedValues = await mongoose.connection.collection(collectionName).find({'entity_name': devices[0].entity_name}).toArray();
    expect(storedValues).toHaveLength(7);
  });


  it('should create a new Sensor sample (ONE_DOCUMENT_PER_TRANSACTION)', async () => {
    // console.log(`Using token: ${userJWT}`);
    process.env.STORAGE_STRATEGY = 'ONE_DOCUMENT_PER_TRANSACTION';
    const [groups, devices] = await Promise.all([storeGroups(1), storeDevices(1)]);
    const samples = createSensorValues(1, devices);
    const collectionName = process.env.STH_PREFIX + '_' + tenant + '_' + devices[0].entity_type;
    await mongoose.connection.collection(collectionName).deleteMany({});
    const savedUser = await saveUsers(createUsers(1, 'sensor'));
    const sensorResponse = await supertest(app)
      .post(`/notify`)
      .set('Authorization', `Bearer ${getToken(savedUser[0])}`)
      .set('Fiware-Service', tenant)
      .set('Fiware-ServicePath', '/')
      .send(samples[0][0].payload);
    expect(sensorResponse.status).toEqual(200);
    const storedValues = await mongoose.connection.collection(collectionName).find({'entity_name': devices[0].entity_name}).toArray();
    expect(storedValues).toHaveLength(1);
    const storedSample = storedValues[0];
    expect(storedSample.status).toEqual('OK');
    expect(storedSample.location.type).toEqual('Point');
    expect(storedSample.location.coordinates).toHaveLength(2);
  });

  it('should report an error if an attribute type is not supported', async () => {
    // console.log(`Using token: ${userJWT}`);
    process.env.STORAGE_STRATEGY = 'ONE_DOCUMENT_PER_TRANSACTION';
    const [groups, devices] = await Promise.all([storeGroups(1), storeDevices(1)]);
    const atts = [{name: 'dummy', type: 'number', value: () => 42}, ...sensor_attributes];
    const samples = createSensorValues(1, devices, atts);
    const collectionName = process.env.STH_PREFIX + '_' + tenant + '_' + devices[0].entity_type;
    await mongoose.connection.collection(collectionName).deleteMany({});
    const savedUser = await saveUsers(createUsers(1, 'sensor'));
    const sensorResponse = await supertest(app)
      .post(`/notify`)
      .set('Authorization', `Bearer ${getToken(savedUser[0])}`)
      .set('Fiware-Service', tenant)
      .set('Fiware-ServicePath', '/')
      .send(samples[0][0].payload);
    expect(sensorResponse.status).toEqual(400);
  });

});

