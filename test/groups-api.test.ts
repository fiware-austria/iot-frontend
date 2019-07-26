import supertest from 'supertest';
import dotenv from 'dotenv';
dotenv.config({path: '.env.test'});
import mongoose from 'mongoose';
import {app} from '../server/app';
import User from '../server/models/user';
import {createUsers, range, saveUsers, getToken, createGroups, storeGroups} from './helpers';
import Group from '../server/models/group';


// (<any>mongoose).Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI,  { useNewUrlParser: true } );
const db = mongoose.connection;




const clearDB = () => Promise.all([Group.deleteMany({}), User.deleteMany({})]);

beforeEach(async () => await clearDB());

afterAll(async () => await clearDB());


describe('POST /iot/services', () => {
  it('should create new Device', async () => {
    // console.log(`Using token: ${userJWT}`);
    const savedUser = await saveUsers(createUsers(1, 'iot-user'));
    const createServiceResponse = await supertest(app)
      .post('/iot/services')
      .set('Authorization', `Bearer ${getToken(savedUser[0])}`)
      .send({services: createGroups(3)});
    expect(createServiceResponse.status).toBe(200);
    const services = await Group.find({});
    expect(services).toHaveLength(3);
  });
  it('should list all Devices', async () => {
    // console.log(`Using token: ${userJWT}`);
    const savedUser = await saveUsers(createUsers(1, 'iot-user'));
    const storedGroups = storeGroups(10);
    const listGroupsResponse = await supertest(app)
      .get('/iot/services')
      .set('Authorization', `Bearer ${getToken(savedUser[0])}`)
      .send();
    expect(listGroupsResponse.status).toBe(200);
    expect(listGroupsResponse.body).toHaveLength(10);
  });
  it('should list one Device', async () => {
    // console.log(`Using token: ${userJWT}`);
    const savedUser = await saveUsers(createUsers(1, 'iot-user'));
    const storedGroups = await storeGroups(10);
    const listGroupsResponse = await supertest(app)
      .get('/iot/services/apiperftest_3')
      .set('Authorization', `Bearer ${getToken(savedUser[0])}`)
      .send();
    expect(listGroupsResponse.status).toBe(200);
    expect(listGroupsResponse.body.apikey).toEqual('apiperftest_3');
  });
});

