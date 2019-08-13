const querystring = require("querystring");
const superagent = require("superagent");
const iot_frontend_server = 'http://localhost:3000';
import {devices} from './devices';

let token = "";


const createDevices = () =>
  superagent.post(iot_frontend_server + '/iot/devices')
    .send({devices: devices})
    .set('Fiware-Service', 'graziot')
    .set('Authorization', `Bearer ${token}`)
    .set('Fiware-ServicePath', '/')

const services = {
  "services": [
    {
      "apikey": "apistatic",
      "entity_type": "test_sensor",
      "resource": "/iot/d"
    },
    {
      "apikey": "apimobile",
      "entity_type": "mobile",
      "resource": "/iot/d"
    },
    {
      "apikey": "apitraffic",
      "entity_type": "traffic",
      "resource": "/iot/d"
    }
  ]
};


const createService = () =>
  Promise.resolve(console.log('Create Service: ' + iot_frontend_server + '/iot/services'))
    .then(() =>
      superagent.post(iot_frontend_server+'/iot/services')
        .send(services)
        .set('Fiware-Service', 'graziot')
        .set('Authorization', `Bearer ${token}`)
        .set('Fiware-ServicePath', '/'))
    .then(r => console.log("Service Created!"))


Promise.resolve()
  .then(createService)
  .then(createDevices)
  .then(() => console.log("DONE!"))
  .catch(err => console.log(err));
