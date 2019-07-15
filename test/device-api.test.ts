import supertest from 'supertest';
import dotenv from 'dotenv';
dotenv.config({path: '.env.test'});
import mongoose from 'mongoose';
import {app} from '../server/app';
import User from '../server/models/user';
import {createUsers, range, saveUsers, getToken, createDevices} from './helpers';
import Device from '../server/models/device';


// (<any>mongoose).Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI,  { useNewUrlParser: true } );
const db = mongoose.connection;



const clearDB = () => Promise.all([Device.deleteMany({}), User.deleteMany({})]);

beforeEach(async () => await clearDB());

afterAll(async () => await clearDB());


describe('POST /iot/devices', () => {
  it('should create new Devices', async () => {
    // console.log(`Using token: ${userJWT}`);
    const savedUser = await saveUsers(createUsers(1, 'iot-user'));
    const createDevicesResponse = await supertest(app)
      .post('/iot/devices')
      .set('Authorization', `Bearer ${getToken(savedUser[0])}`)
      .send({devices: createDevices(5)});
    expect(createDevicesResponse.status).toBe(200);
    const devices = await Device.find({});
    expect(devices).toHaveLength(5);
  });
});

