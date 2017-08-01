import * as supertest from 'supertest';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import {app} from '../server/app';
import Cat from '../server/models/cat';

dotenv.load({ path: '.env.test' });


beforeAll(done => {
  console.log('Setting up Database Connection');
  mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true});
  const db = mongoose.connection;
  (<any>mongoose).Promise = global.Promise;
  db.on('error', done);
  db.once('open', done);
});

beforeEach(async () => await Cat.remove());

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

