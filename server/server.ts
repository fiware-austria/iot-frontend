import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
dotenv.load({ path: '.env' });
import {app, ioServer} from './app';
mongoose.connect(process.env.MONGODB_URI,{ useNewUrlParser: true } );
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



