import * as supertest from 'supertest';
import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import {app, ioServer} from '../server/app';
import * as io from 'socket.io-client';
import Cat from '../server/models/cat';
import User from '../server/models/user';
import * as jwt from 'jsonwebtoken';
import * as Bluebird from 'bluebird';
import {IUser} from '../server/models/types';
mongoose.Promise = Bluebird;
mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
const db = mongoose.connection;

let socket: io.Socket;

dotenv.load({path: '.env.test'});


beforeAll(done =>
  ioServer.listen(process.env.WSPORT || 4300, () => done()));

afterAll(done => ioServer.close(() => done()));

beforeEach(done => {
  socket = io.connect(`http://localhost:${process.env.WSPORT || 4300}`, {
    'reconnection delay' : 0
    , 'reopen delay' : 0
    , 'force new connection' : true
  });
  socket.on('connect', function() {
    console.log('worked...');
    done();
  });
  socket.on('disconnect', function() {
    console.log('disconnected...');
  })
});

afterEach(function(done) {
  // Cleanup
  if (socket.connected) {
    console.log('disconnecting...');
    socket.disconnect();
  } else {
    // There will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
    console.log('no connection to break...');
  }
  done();
});

describe('Chat API', () => {
  it('should return a dummy message', async () => {
    const getResponse = await supertest(app).get('/api/chat/test');
    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual([]);
  })
});
