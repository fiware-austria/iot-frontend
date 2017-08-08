import * as supertest from 'supertest';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import {app} from '../server/app';
import Cat from '../server/models/cat';
import User from '../server/models/user';
import * as Bluebird from 'bluebird';
mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
const db = mongoose.connection;
(<any>mongoose).Promise = Bluebird;

dotenv.load({path: '.env.test'});

const clearDB = () => Promise.all([User.remove(), Cat.remove()]);

beforeAll(done => {
  console.log('Setting up Database Connection');

  db.on('error', done);
  db.once('open', done);
});

beforeEach(async () => await clearDB());

describe('Create new Users', () => {
  it('should be possible to register as a new user, but the role always needs to be \'user\'', async () => {
    const user = {
      username: 'test',
      email: 'test@test.com',
      passord: 'topsecret'
    };
    const newUserResponse = await supertest(app).post('/api/user').send(user);
    expect(newUserResponse.status).toBe(200);
    const newUser = newUserResponse.body;
    expect(newUser.provider).toBe('local');
    expect(newUser.role).toBe('user');
  });
});
