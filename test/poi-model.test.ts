import * as supertest from 'supertest';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import User from '../server/models/user';
import POI from '../server/models/poi';
import * as Bluebird from 'bluebird';
import {createUsers, range, saveUsers, getToken} from './helpers';

dotenv.load({path: '.env.test'});
mongoose.Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
const db = mongoose.connection;

describe('POI Model', () => {
  it('should not be possible to create a POI with missing properties', async () => {
    try {
      await new POI().save();
      throw Error('This should fail with an error!');
    } catch (err) {
      const errors = err.errors;
      expect(errors.creator).toBeDefined();
      expect(errors.creator.kind).toBe('required');
      expect(errors.name).toBeDefined();
      expect(errors.name.kind).toBe('required');
      expect(errors['loc.coordinates']).toBeDefined();
      expect(errors['loc.coordinates'].kind).toBe('required');
    }
  });
  it('should store a POI', async () => {
    const poi = {
      name: 'POI1',
      loc: {coordinates: [1,1]}
    };
  });
});
