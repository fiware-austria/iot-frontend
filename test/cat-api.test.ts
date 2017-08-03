import * as supertest from 'supertest';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import {app} from '../server/app';
import Cat from '../server/models/cat';
import User from '../server/models/user';
import * as jwt from 'jsonwebtoken';

dotenv.load({path: '.env.test'});

let testUser = {
  email: 'test@test.com',
  password: 'topsecret',
  username: 'test'
};

let userJWT: string;

beforeAll(done => {
  console.log('Setting up Database Connection');
  mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
  const db = mongoose.connection;
  (<any>mongoose).Promise = global.Promise;
  db.on('error', done);
  db.once('open', () =>
    User.remove().then(() =>
    new User(testUser).save(user => {
      testUser = user;
      userJWT = jwt.sign({user: user}, process.env.SECRET_TOKEN);
    }))
      .then(done)
      .catch(done)
  );
});

afterAll(done => User.remove().then(done).catch(done));

beforeEach(async () => await Cat.remove());


const range = (size) => {
  const result = Array<number>(size);
  for (let i = 0; i < size; i += 1) {
    result[i] = i + 1;
  }
  return result;
}

const createCats = (number) =>
  range(number).map(nr => ({
    name: `Cat${nr}`,
    weight: nr,
    age: nr
  }));

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
    const loginResponse = await supertest(app)
      .post('/api/cat')
      .set('Authorization', `Bearer ${userJWT}`)
      .send(createCats(1)[0]);
    expect(loginResponse.status).toBe(200);
    const cat = loginResponse.body;
    expect(cat.name).toBe('Cat1');
    expect(cat.weight).toBe(1);
    expect(cat.age).toBe(1);
  });
});

