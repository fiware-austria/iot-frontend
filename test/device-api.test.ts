import supertest from 'supertest';
import dotenv from 'dotenv';
dotenv.config({path: '.env.test'});
import mongoose from 'mongoose';
import {app} from '../server/app';
import Cat from '../server/models/cat';
import User from '../server/models/user';
// import * as Bluebird from 'bluebird';
import {createUsers, range, saveUsers, getToken, createDevices} from './helpers';
import Device from '../server/models/device';


// (<any>mongoose).Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI,  { useNewUrlParser: true } );
const db = mongoose.connection;



const clearDB = () => Promise.all([Device.deleteMany({}), User.deleteMany({})]);

beforeEach(async () => await clearDB());

afterAll(async () => await clearDB());

/*
describe('GET /cats', () => {
  it('should load an emtpy list of cats', async () => {
    const response = await supertest(app).get('/cats');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
  it('should return cats if they are in the database', async () => {
    const tom = new Cat({name: 'Tom', weight: 4});
    const savedCat = await tom.save();
    const response = await supertest(app).get('/cats');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1)
    expect(response.body[0].name).toEqual(savedCat.name);
    expect(response.body[0]._id.toString()).toBe(savedCat._id.toString());
    expect(response.body[0].weight).toEqual(savedCat.weight);
  });
});

 */

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

