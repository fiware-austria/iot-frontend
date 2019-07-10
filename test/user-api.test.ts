import supertest from 'supertest';
import dotenv from 'dotenv';
dotenv.config({path: '.env.test'});
import mongoose from 'mongoose';
import {app} from '../server/app';
import Cat from '../server/models/cat';
import User from '../server/models/user';
import * as Bluebird from 'bluebird';
import {IUser} from '../server/models/types';
import * as jwt from 'jsonwebtoken';
import {createUsers, saveUsers } from './helpers';


mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true } );
const db = mongoose.connection;
//(<any>mongoose).Promise = Bluebird;


const clearDB = () => User.deleteMany({});
const getToken = (user: IUser) => jwt.sign({ user: user }, process.env.SECRET_TOKEN);


beforeEach(async () => await clearDB());
afterEach(async () => await clearDB());

describe('Create new Users', () => {
  it('should be possible to register as a new user, but the role always needs to be \'user\'', async () => {
    const user = {
      username: 'test',
      email: 'test@test.com',
      passord: 'topsecret'
    };
    const newUserResponse = await supertest(app).post('/users').send(user);
    expect(newUserResponse.status).toBe(200);
    const newUser = newUserResponse.body;
    expect(newUser.provider).toBe('local');
    expect(newUser.role).toBe('user');
  });
});

describe('Reading user profiles', () => {

  it('should be not allowed for visitors to list users', async () => {
    const listUsersResponse = await supertest(app).get('/users');
    expect(listUsersResponse.status).toBe(401);
  });

  it('should be not allowed for non-admins to list users', async () => {
    const savedUsers = await saveUsers(createUsers(1));
    const listUsersResponse = await supertest(app).get('/users')
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`);
    expect(listUsersResponse.status).toBe(403);
  });

  it('should be allowed for admins to list users', async () => {
      const savedUsers = await saveUsers(createUsers(4));
      const savedAdmins = await saveUsers(createUsers(1, 'admin', 'admin'));
      const listUsersResponse = await supertest(app).get('/users')
        .set('Authorization', `Bearer ${getToken(savedAdmins[0])}`);
      expect(listUsersResponse.status).toBe(200);
      expect(listUsersResponse.body).toHaveLength(5);
  });

  it('should not be possible to read a profile without authentication', async () => {
    const user = createUsers(1)[0];
    const savedUser = await new User(user).save();
    const showProfileResponse = await supertest(app).get(`/users/${savedUser._id}`);
    expect(showProfileResponse.status).toBe(401);
  });

  it('should not be possible to read some other user\'s profile', async () => {
    const savedUsers = await saveUsers(createUsers(2));
    const showProfileReponse = await supertest(app)
      .get(`/users/${savedUsers[1]._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`);
    expect(showProfileReponse.status).toBe(403);
  });

  it('should be possible to read your own profile', async () => {
    const savedUsers = await saveUsers(createUsers(1));
    const showProfileReponse = await supertest(app)
      .get(`/users/${savedUsers[0]._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`);
    expect(showProfileReponse.status).toBe(200);
    expect(showProfileReponse.body._id.toString()).toBe(savedUsers[0]._id.toString());
  });

  it('should be possible for admins to read any profile', async () => {
    const savedUsers = await saveUsers(createUsers(1));
    const savedAdmins = await saveUsers(createUsers(1, 'admin', 'admin'));
    const showProfileReponse = await supertest(app)
      .get(`/users/${savedUsers[0]._id}`)
      .set('Authorization', `Bearer ${getToken(savedAdmins[0])}`);
    expect(showProfileReponse.status).toBe(200);
    expect(showProfileReponse.body._id.toString()).toBe(savedUsers[0]._id.toString());
  });

});

describe('Updating user profiles', () => {

  it('should not be possible to update somebody else\'s profile', async () => {
    const savedUsers = await saveUsers(createUsers(2));
    savedUsers[1].username = 'dummy';
    const profileUpdateResponse = await supertest(app)
      .put(`/users/${savedUsers[1]._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`)
      .send(savedUsers[1]);
    expect(profileUpdateResponse.status).toBe(403);
  });

  it('should be possible for users to update their own profile', async () => {
    const savedUsers = await saveUsers(createUsers(2));
    savedUsers[1].username = 'dummy';
    const profileUpdateResponse = await supertest(app)
      .put(`/users/${savedUsers[1]._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[1])}`)
      .send(savedUsers[1]);
    expect(profileUpdateResponse.status).toBe(200);
    expect(profileUpdateResponse.body.username).toBe('dummy');
    expect(profileUpdateResponse.body.email).toBe(savedUsers[1].email);
  });

  it('should not be possible for users to change their own role', async () => {
    const savedUsers = await saveUsers(createUsers(2));
    savedUsers[1].role = 'admin';
    const profileUpdateResponse = await supertest(app)
      .put(`/users/${savedUsers[1]._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[1])}`)
      .send(savedUsers[1]);
    expect(profileUpdateResponse.status).toBe(200);
    expect(profileUpdateResponse.body.role).toBe('user');
    expect(profileUpdateResponse.body.email).toBe(savedUsers[1].email);
  });

  it('should be possible for admins to change the role of other users', async () => {
    const savedUsers = await saveUsers(createUsers(2));
    const savedAdmins = await saveUsers(createUsers(1, 'admin', 'admin'));
    savedUsers[1].role = 'admin';
    const profileUpdateResponse = await supertest(app)
      .put(`/users/${savedUsers[1]._id}`)
      .set('Authorization', `Bearer ${getToken(savedAdmins[0])}`)
      .send(savedUsers[1]);
    expect(profileUpdateResponse.status).toBe(200);
    expect(profileUpdateResponse.body.role).toBe('admin');
    expect(profileUpdateResponse.body.email).toBe(savedUsers[1].email);
  });
});

describe('Deleting users', () => {
  it('should not be possible to delete users if you are not an admin', async () => {
    const savedUsers = await saveUsers(createUsers(1));
    const deleteUserResponse = await supertest(app)
      .delete(`/users/${savedUsers[0]._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`);
    expect(deleteUserResponse.status).toBe(403);
  });
  it('should allow admins to delete users', async () => {
    const savedUsers = await saveUsers(createUsers(1));
    const savedAdmins = await saveUsers(createUsers(1, 'admin', 'admin'));
    const deleteUserResponse = await supertest(app)
      .delete(`/users/${savedAdmins[0]._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`);
    expect(deleteUserResponse.status).toBe(403);
  });
});
