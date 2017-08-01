import * as bodyParser from 'body-parser';

import * as express from 'express';
import * as morgan from 'morgan';

import * as path from 'path';

import setRoutes from './routes';

const app = express();

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan('dev'));

setRoutes(app);
console.log('Registered Routes');
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});


export { app };
