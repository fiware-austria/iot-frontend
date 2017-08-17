import * as supertest from 'supertest';
import * as dotenv from 'dotenv';
dotenv.load({path: '.env.test'});
import * as mongoose from 'mongoose';
import {app, ioServer} from '../server/app';
import * as io from 'socket.io-client';


(<any>mongoose).Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, {useMongoClient: true});
const db = mongoose.connection;


let socket: SocketIOClient.Socket;




beforeAll(done =>
  ioServer.listen(process.env.WSPORT || 4300, () => done()));

afterAll(done => ioServer.close(() => done()));

beforeEach(done => {
  socket = io.connect(`http://localhost:${process.env.WSPORT || 4300}`, {
    'reconnectionDelay' : 0
    , 'forceNew' : true
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
