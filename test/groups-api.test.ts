import supertest from 'supertest';
import dotenv from 'dotenv';
dotenv.config({path: '.env.test'});
import mongoose from 'mongoose';
import {app} from '../server/app';
import User from '../server/models/user';
import {createUsers, range, saveUsers, getToken, createGroups} from './helpers';
import Group from '../server/models/group';


// (<any>mongoose).Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI,  { useNewUrlParser: true } );
const db = mongoose.connection;




const clearDB = () => Promise.all([Group.deleteMany({}), User.deleteMany({})]);

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

describe('POST /iot/services', () => {
  it('should create new Devices', async () => {
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
});

