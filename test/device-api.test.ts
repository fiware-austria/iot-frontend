import supertest from 'supertest';
import dotenv from 'dotenv';
dotenv.config({path: '.env.test'});
import mongoose from 'mongoose';
import {app} from '../server/app';
import User from '../server/models/user';
import {createUsers, range, saveUsers, getToken, createDevices, storeDevices} from './helpers';
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
  it('should list all registered devices', async () => {
    // console.log(`Using token: ${userJWT}`);
    const savedUser = await saveUsers(createUsers(1, 'iot-user'));
    const storedDevices = await storeDevices(10)
    const listDevicesResponse = await supertest(app)
      .get('/iot/devices')
      .set('Authorization', `Bearer ${getToken(savedUser[0])}`)
      .send();
    expect(listDevicesResponse.status).toBe(200);
    expect(listDevicesResponse.body).toHaveLength(10);
    expect(listDevicesResponse.body[0].attributes).toBeUndefined();
  });
  it('should get the details of a registered device', async () => {
    // console.log(`Using token: ${userJWT}`);
    const savedUser = await saveUsers(createUsers(1, 'iot-user'));
    const storedDevices = await storeDevices(10)
    const listDevicesResponse = await supertest(app)
      .get('/iot/devices/test_device_5')
      .set('Authorization', `Bearer ${getToken(savedUser[0])}`)
      .send();
    expect(listDevicesResponse.status).toBe(200);
    expect(listDevicesResponse.body.device_id).toEqual('test_device_5');
    const device5 = listDevicesResponse.body;
    expect(device5.attributes).toHaveLength(9);
  });
});

