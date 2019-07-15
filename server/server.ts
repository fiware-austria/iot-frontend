import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: '.env' });
import {app} from './app';
import {catSystem} from './config';

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true } );
const db = mongoose.connection;
(<any>mongoose).Promise = global.Promise;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  catSystem.info('Connected to MongoDB');
  app.listen(app.get('port'), () => {
    catSystem.info('Angular Full Stack listening on port ' + app.get('port'));
  });
});



