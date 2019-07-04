import supertest from 'supertest';
import dotenv from 'dotenv';
dotenv.config({path: '.env.test'});
import mongoose from 'mongoose';
import {app} from '../server/app';
import Cat from '../server/models/cat';
import User from '../server/models/user';
// import * as Bluebird from 'bluebird';
import {createUsers, range, saveUsers, getToken} from './helpers';


// (<any>mongoose).Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI,  { useNewUrlParser: true } );
const db = mongoose.connection;

const createCats = (number) =>
  range(number).map(nr => ({
    name: `Cat${nr}`,
    weight: nr,
    age: nr
  }));


const clearDB = () => Promise.all([Cat.deleteMany({}), User.deleteMany({})]);

beforeEach(async () => await clearDB());

afterAll(async () => await clearDB());


describe('GET /api/cats', () => {
  it('should load an emtpy list of cats', async () => {
    const response = await supertest(app).get('/api/cats');
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
  it('should return cats if they are in the database', async () => {
    const tom = new Cat({name: 'Tom', weight: 4});
    const savedCat = await tom.save();
    const response = await supertest(app).get('/api/cats');
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1)
    expect(response.body[0].name).toEqual(savedCat.name);
    expect(response.body[0]._id.toString()).toBe(savedCat._id.toString());
    expect(response.body[0].weight).toEqual(savedCat.weight);
  });
});

describe('POST /api/cat', () => {
  it('should create a new Cat if the current user is logged in', async () => {
    // aconsole.log(`Using token: ${userJWT}`);
    const savedUser = await saveUsers(createUsers(1, 'catlover'));
    const loginResponse = await supertest(app)
      .post('/api/cat')
      .set('Authorization', `Bearer ${getToken(savedUser[0])}`)
      .send(createCats(1)[0]);
    expect(loginResponse.status).toBe(200);
    const cat = loginResponse.body;
    expect(cat.name).toBe('Cat1');
    expect(cat.weight).toBe(1);
    expect(cat.age).toBe(1);
  });
});

