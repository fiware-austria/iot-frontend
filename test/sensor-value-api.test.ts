import supertest from 'supertest';
import dotenv from 'dotenv';
dotenv.config({path: '.env.test'});
import mongoose from 'mongoose';
import {app} from '../server/app';
import SensorValue from '../server/models/sensor-value';


// import * as Bluebird from 'bluebird';
import {createUsers, range, saveUsers, getToken} from './helpers';
import User from '../server/models/user';


// (<any>mongoose).Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI,  { useNewUrlParser: true } );
const db = mongoose.connection;


const randomValue = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100

const createSensorValues = (number) =>
  range(number).map(nr => ({
    name: `Sensor${nr}`,
    payload: 't|' + randomValue(-10, 39) + '|h|' + randomValue(0, 100) + '|ap|' + randomValue(920, 1100) +
      '|t2|' + randomValue(20, 60) + '|ap2|' + randomValue(920, 1100) + '|pm10|' + randomValue(0, 90) +
      '|pm25|' + randomValue(0, 90)
  }));


const clearDB = () => Promise.all([SensorValue.deleteMany({}), User.deleteMany({})]);

beforeEach(async () => await clearDB());

afterAll(async () => await clearDB());



describe('POST /api/iot/d', () => {
  it('should create a new Cat if the current user is logged in', async () => {
    // aconsole.log(`Using token: ${userJWT}`);
    const sensor = createSensorValues(1)[0];
    const savedUser = await saveUsers(createUsers(1, 'sensor'));
    const loginResponse = await supertest(app)
      .post(`/api/iot/d?i=${sensor.name}&k=test`)
      .set('Authorization', `Bearer ${getToken(savedUser[0])}`)
      .type('text')
      .send(sensor.payload);
    expect(loginResponse.status).toBe(200);
    const cat = loginResponse.body;
  });
});

