import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import {app} from './app';
dotenv.load({ path: '.env' });
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true});
const db = mongoose.connection;
(<any>mongoose).Promise = global.Promise;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(app.get('port'), () => {
    console.log('Angular Full Stack listening on port ' + app.get('port'));
  });
});



