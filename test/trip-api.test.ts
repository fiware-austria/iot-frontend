import * as supertest from 'supertest';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
const config = dotenv.config({path: '.env.test'});
console.log(config.pased);
import {app} from '../server/app';
import POI from '../server/models/poi';
import User from '../server/models/user';
import Trip from '../server/models/trip';
import * as Bluebird from 'bluebird';
import {IPOI, IPOIModel, IUser} from '../server/models/types';
import * as jwt from 'jsonwebtoken';
import {createAndSavePOIs, createAndSaveUsers, getToken} from './helpers';



mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
const db = mongoose.connection;
(<any>mongoose).Promise = Bluebird;


const clearDB = () => Promise.all([User.remove({}), POI.remove({}), Trip.remove({})]);


beforeEach(async () => await clearDB());
afterAll(async () => await clearDB());

describe('Create Trips', () => {
  it('should not be possible to create trips without being logged-in', async () => {
    const savedUsers = await createAndSaveUsers(1);
    const trip = {
      name: 'myTrip',
      loc: { coordinates: [31, 21]}
    }
    const createResponse = await supertest(app).post('/api/trip').send(trip);
    expect(createResponse.status).toBe(401);
  });
  it('should be possible to create a trip when logged-in', async () => {
    const savedUsers = await createAndSaveUsers(1);
    const trip = {
      name: 'myTrip',
      loc: { coordinates: [31, 21]}
    }
    const createResponse = await supertest(app).post('/api/trip')
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`)
      .send(trip);
    expect(createResponse.status).toBe(200);
    expect(createResponse.body.name).toBe('myTrip');
    expect(createResponse.body._id).toBeDefined();
    expect(createResponse.body.pois).toBeInstanceOf(Array);
    expect(createResponse.body.pois).toHaveLength(0);
    expect(createResponse.body.creator._id.toString()).toBe(savedUsers[0]._id.toString());
    expect(createResponse.body.creator.username).toBe(savedUsers[0].username);
  });
  it('should be impossible to create trips on somebody else\'s behalf', async () => {
    const savedUsers = await createAndSaveUsers(2);
    const trip = {
      name: 'myTrip',
      loc: { coordinates: [31, 21]},
      creator: savedUsers[1]._id
    }
    const createResponse = await supertest(app).post('/api/trip')
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`)
      .send(trip);
    expect(createResponse.status).toBe(200);
    expect(createResponse.body.name).toBe('myTrip');
    expect(createResponse.body._id).toBeDefined();
    expect(createResponse.body.pois).toBeInstanceOf(Array);
    expect(createResponse.body.pois).toHaveLength(0);
    expect(createResponse.body.creator._id.toString()).toBe(savedUsers[0]._id.toString());
    expect(createResponse.body.creator.username).toBe(savedUsers[0].username);
  });
});

describe('Update Trips', () => {
  it('should be possible to update your onw trip', async () => {
    const savedUsers = await createAndSaveUsers(2);
    const trip = {
      name: 'myTrip',
      loc: { coordinates: [31, 21]},
      creator: savedUsers[0]._id
    };
    const savedTrip = await Trip.create(trip);
    trip.name = 'My other Trip';
    const updateResponse = await supertest(app)
      .put(`/api/trip/${savedTrip._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`)
      .send(trip);
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.name).toBe('My other Trip');
    expect(updateResponse.body.creator.username).toBe(savedUsers[0].username);
  });
  it('should not be possible to update somebody else\'s trip', async () => {
    const savedUsers = await createAndSaveUsers(2);
    const trip = {
      name: 'myTrip',
      loc: { coordinates: [31, 21]},
      creator: savedUsers[0]._id
    };
    const savedTrip = await Trip.create(trip);
    trip.name = 'My other Trip';
    const updateResponse = await supertest(app)
      .put(`/api/trip/${savedTrip._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[1])}`)
      .send(trip);
    expect(updateResponse.status).toBe(403);
  });
  it('should not be possible to change the ownership of a trip', async () => {
    const savedUsers = await createAndSaveUsers(2);
    const trip = {
      name: 'myTrip',
      loc: { coordinates: [31, 21]},
      creator: savedUsers[0]._id
    };
    const savedTrip = await Trip.create(trip);
    trip.name = 'My other Trip';
    trip.creator = savedUsers[1]._id;
    const updateResponse = await supertest(app)
      .put(`/api/trip/${savedTrip._id}`)
      .set('Authorization', `Bearer ${getToken(savedUsers[0])}`)
      .send(trip);
    console.log('BODY: ' + JSON.stringify(updateResponse.body));
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.creator.username).toBe(savedUsers[0].username);
    expect(updateResponse.body.creator._id.toString()).toBe(savedUsers[0]._id.toString());
  });
});
