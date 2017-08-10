import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import {app, ioServer} from './app';
dotenv.load({ path: '.env' });
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true});
const db = mongoose.connection;
(<any>mongoose).Promise = global.Promise;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
  ioServer.listen(process.env.WSPORT || 4300, () => {
    console.log('WebSockets are available at port ' + (process.env.WSPORT || 4300));
  });
  app.listen(app.get('port'), () => {
    console.log('Angular Full Stack listening on port ' + app.get('port'));
  });
});



