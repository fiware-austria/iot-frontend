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


// (<any>mongoose).Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI,  { useNewUrlParser: true } );
const db = mongoose.connection;


const randomValue = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100

const createSensorValues = (number) =>
  range(number).map(nr => ({
    payload: 't|' + randomValue(-10, 39) + '|h|' + randomValue(0, 100) + '|ap|' + randomValue(920, 1100) +
      '|t2|' + randomValue(20, 60) + '|ap2|' + randomValue(920, 1100) + '|pm10|' + randomValue(0, 90) +
      '|pm25|' + randomValue(0, 90) + '|s|ok|l|43.44344,23.34333'
  }));


const clearDB = () => Promise.all([
  SensorValue.deleteMany({}),
  User.deleteMany({}),
  Device.deleteMany({}),
  Group.deleteMany({})
  ]);

beforeEach(async () => await clearDB());

afterAll(async () => await clearDB());



describe('POST /api/iot/d', () => {
  it('should create a new Sensor sample (ONE_DOCUMENT_PER_VALUE)', async () => {
    // console.log(`Using token: ${userJWT}`);
    process.env.STORAGE_STRATEGY = 'ONE_DOCUMENT_PER_VALUE';
    const sensor = createSensorValues(1)[0];
    const [groups, devices] = await Promise.all([storeGroups(1), storeDevices(3)]);
    const collectionName = process.env.STH_PREFIX + groups[0].apikey + '_' + devices[1].entity_type;
    await mongoose.connection.collection(collectionName).deleteMany({});
    const savedUser = await saveUsers(createUsers(1, 'sensor'));
    const sensorResponse = await supertest(app)
      .post(`/iot/d?i=${devices[1].device_id}&k=${groups[0].apikey}`)
      .set('Authorization', `Bearer ${getToken(savedUser[0])}`)
      .type('text')
      .send(sensor.payload);
    expect(sensorResponse.status).toEqual(200);
    const storedValues = await mongoose.connection.collection(collectionName).find({'sensorId': devices[1].device_id}).toArray();
    expect(storedValues).toHaveLength(9);
    await mongoose.connection.collection(collectionName).deleteMany({});

  });

  it('should create a new Sensor sample (ONE_DOCUMENT_PER_TRANSACTION)', async () => {
    // console.log(`Using token: ${userJWT}`);
    process.env.STORAGE_STRATEGY = 'ONE_DOCUMENT_PER_TRANSACTION';
    const sensor = createSensorValues(1)[0];
    const [groups, devices] = await Promise.all([storeGroups(1), storeDevices(3)]);
    const collectionName = process.env.STH_PREFIX + groups[0].apikey + '_' + devices[1].entity_type;
    await mongoose.connection.collection(collectionName).deleteMany({});
    const savedUser = await saveUsers(createUsers(1, 'sensor'));
    const sensorResponse = await supertest(app)
      .post(`/iot/d?i=${devices[1].device_id}&k=${groups[0].apikey}`)
      .set('Authorization', `Bearer ${getToken(savedUser[0])}`)
      .type('text')
      .send(sensor.payload);
    expect(sensorResponse.status).toEqual(200);
    const storedValues = await mongoose.connection.collection(collectionName).find({'sensorId': devices[1].device_id}).toArray();
    expect(storedValues).toHaveLength(1);
    const storedSample = storedValues[0];
    expect(storedSample.status).toEqual('ok');
    await mongoose.connection.collection(collectionName).deleteMany({});

  });
});

