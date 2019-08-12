import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({path: '.env.test'});
import Group from '../server/models/group';
import {IDeviceDocument, IGroupDocument} from '../server/models/types';
import Device from '../server/models/device';


mongoose.connect(process.env.MONGODB_URI,  { useNewUrlParser: true } );
const db = mongoose.connection;
(<any>mongoose).Promise = global.Promise;


const clearDB = () => Promise.all([Group.deleteMany({})]);

afterAll(async () => await clearDB());

beforeEach(async () => await clearDB());

describe('User Schema', () => {
  it('should not allow to create empty users', (done) => {
    const groupValue = {};
    new Group(groupValue).save().then(() => done('Empty Groups\'s are not allowed to be stored'))
      .catch(err => {
        const errors = err.errors;
        expect(errors.apikey).toBeDefined();
        expect(errors.apikey.kind).toBe('required');
        expect(errors.entity_type).toBeDefined();
        expect(errors.entity_type.kind).toBe('required');
        expect(errors.resource).toBeDefined();
        expect(errors.resource.kind).toBe('required');
        done();
      });
  });

  it('should allow groups to be created', async () => {
    const service = {
      'apikey': 'apiperftest',
      'service': 'test_tenant',
      'token': 'token2',
      'entity_type': 'test_sensor',
      'resource': '/iot/d'
    };
    const value: IGroupDocument = await new Group(service).save();
    expect(value._id).toBeDefined();
    expect(value.apikey).toEqual(service.apikey);
    expect(value.token).toEqual(service.token);
    expect(value.entity_type).toEqual(service.entity_type);
    expect(value.resource).toEqual(service.resource);
  });

  it('should not be allowed to create groups with identical apiKeys and entity_type', async () => {
    const service = {
      'apikey': 'apiperftest',
      'token': 'token2',
      'service': 'test_tenant',
      'entity_type': 'test_sensor',
      'resource': '/iot/d'
    };
    const value: IGroupDocument = await new Group(service).save();
    try {
      const value2: IGroupDocument = await new Group(service).save();
      fail('It must not be possible to create two devices with the same id!')
    } catch (e) {
      if (e.code !== 11000) {
        fail('This was not a duplicate key error!')
      }
    }
  });
});
