import * as supertest from 'supertest';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import {app} from '../server/app';
import Cat from '../server/models/cat';
import User from '../server/models/user';
import * as jwt from 'jsonwebtoken';
import * as Bluebird from 'bluebird';
mongoose.Promise = Bluebird;

dotenv.load({path: '.env.test'});

let testUser = {
  email: 'test@test.com',
  password: 'topsecret',
  username: 'test',
  provider: 'local',
  role: 'user'
};

let userJWT: string;

beforeAll(done => {

  mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
  const db = mongoose.connection;
  db.on('error', (err) => {
    console.log(`Error: ${err}`);
    done(err);
  });
  db.once('open', async () => {
    try {
      const result = await User.remove();
      testUser = await new User(testUser).save();
      userJWT = jwt.sign({user: testUser}, process.env.SECRET_TOKEN);
      done();
    } catch (e) {
      console.log(`ERROR: ${e}`);
      done(e);
    }
  });
});

afterAll(done => User.remove().then(done).catch(done));

beforeEach(async () => await Cat.remove());


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

