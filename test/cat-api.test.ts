import * as supertest from 'supertest';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import {app} from '../server/app';
import Cat from '../server/models/cat';
import User from '../server/models/user';
import * as jwt from 'jsonwebtoken';
import * as Bluebird from 'bluebird';
import {IUser} from '../server/models/types';
mongoose.Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
const db = mongoose.connection;

dotenv.load({path: '.env.test'});

const range = (size) => {
  const result = Array<number>(size);
  for (let i = 0; i < size; i += 1) {
    result[i] = i + 1;
  }
  return result;
};

const createCats = (number) =>
  range(number).map(nr => ({
    name: `Cat${nr}`,
    weight: nr,
    age: nr
  }));

const createUsers = (number, prefix = 'user', role = 'user'): Array<IUser> =>
  range(number).map(nr => ({
    username: `${prefix}${nr}`,
    email: `${prefix}${nr}@test.com`,
    password: 'topsecret',
    provider: 'local',
    role : role
  }));

const saveUsers = (users: Array<IUser>) =>
  Promise.all(users.map(u => new User(u).save()));

const clearDB = () => Promise.all([Cat.remove(), User.remove()]);

beforeEach(async () => await clearDB());

afterAll(async () => await clearDB());

const getToken = (user: IUser) => jwt.sign({ user: user }, process.env.SECRET_TOKEN);



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
    expect(response.body[0].name).toEqual(savedCat.name);
    expect(response.body[0]._id.toString()).toBe(savedCat._id.toString());
    expect(response.body[0].weight).toEqual(savedCat.weight);
  });
});

describe('POST /api/cat', () => {
  it('should create a new Cat if the current user is logged in', async () => {
    // aconsole.log(`Using token: ${userJWT}`);
    const savedUser = await saveUsers(createUsers(1, 'catlover'));
    console.log(savedUser);
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

