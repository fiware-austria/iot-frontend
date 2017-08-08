import * as supertest from 'supertest';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import {app} from '../server/app';
import Cat from '../server/models/cat';
import User from '../server/models/user';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';
import {GitHubUser} from '../server/models/types';

dotenv.load({path: '.env.test'});


beforeAll(done => {
  console.log('Setting up Database Connection');
  mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
  const db = mongoose.connection;
  (<any>mongoose).Promise = global.Promise;
  db.on('error', done);
  db.once('open', () => done())
    .then(done)
    .catch(done);
});

const clearDB = () => Promise.all([User.remove(), Cat.remove()]);

afterAll(async () => await clearDB());

beforeEach(async () => await clearDB());

describe('User Schema', () => {
  it('should not allow to create empty users', (done) => {
    const user = {};
    new User(user).save().then(() => done('Empty user\'s are not allowed to be stored'))
      .catch(err => {
        const errors = err.errors;
        expect(errors.provider).toBeDefined();
        expect(errors.provider.kind).toBe('required');
        expect(errors.email).toBeDefined();
        expect(errors.email.kind).toBe('required');
        expect(errors.username).toBeDefined();
        expect(errors.username.kind).toBe('required');
        expect(errors.role).toBeDefined();
        expect(errors.role.kind).toBe('required');
        done();
      });
  });
  it('should not allow to create a user with unknown role', (done) => {
    const user = {
      username: 'test',
      email : 'test@test.com',
      password: 'topsecret',
      provider: 'local',
      role: 'test'
    };
    new User(user).save().then(() => done('User\'s without valid roles are not allowed to be stored'))
      .catch(err => {
        const errors = err.errors;
        expect(errors.role).toBeDefined();
        expect(errors.role.kind).toBe('enum');
        done();
      });
  });
  it('should allow users to be created', async () => {
    const user = {
      username: 'test',
      email : 'test@test.com',
      password: 'topsecret',
      provider: 'local',
      role: 'user'
    };
    const newUser = await new User(user).save();
    expect(newUser._id).toBeDefined();
    expect(bcrypt.compareSync('topsecret', newUser.password)).toBeTruthy();
  });
  it('should find or create a new user', async () => {
    const gitHubUser: GitHubUser = {
      username: 'githubuser',
      provider: 'github',
      emails: [
        {value: 'test@github.com', primary: true, verified: true},
        {value: 'test@users.noreply.github.com', primary: false, verified: true},
      ]
    };

    const checkUser = (result, gitHubUser) => {
      expect(result.username).toBe(gitHubUser.username);
      expect(result.email).toBe(gitHubUser.emails[0].value);
      expect(result._id).toBeDefined();
      expect(result.provider).toBe(gitHubUser.provider);
      expect(result.role).toBe('user');
    };
    const user1 = await User.findOrCreate(gitHubUser);
    checkUser(user1, gitHubUser);
    const user2 = await User.findOrCreate(gitHubUser);
    checkUser(user2, gitHubUser);
    expect(user1._id).toEqual(user2._id);
  });
});
