import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config({ path: '.env' });
import {app} from './app';
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true } );
const db = mongoose.connection;
(<any>mongoose).Promise = global.Promise;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
  app.listen(app.get('port'), () => {
    console.log('Angular Full Stack listening on port ' + app.get('port'));
  });
});



