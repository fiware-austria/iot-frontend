const querystring = require("querystring");
const superagent = require("superagent");
const iot_frontend_server = 'http://cupertino:32111'


let token = "";
/*
createEntity = n => {
  return {
    id: `TestSensor${n}`,
    type: 'test_sensor',
    description: `Performance Test Sensor No. ${n}`
  }
};

createDevice = n => {
  return {
    devices: [
      {
        "device_id": `test_device_${n}`,
        "entity_name": `TestSensor${n}`,
        "entity_type": "test_sensor",
        "timezone": "Europe/Vienna",
        "attributes": [
          {
            "object_id": "t",
            "name": "temperature",
            "type": "Float"
          },
          {
            "object_id": "h",
            "name": "humidity",
            "type": "Float"
          },
          {
            "object_id": "pm25",
            "name": "pm25",
            "type": "Float"
          },
          {
            "object_id": "pm10",
            "name": "pm10",
            "type": "Float"
          },
          {
            "object_id": "ap",
            "name": "airPressure",
            "type": "Float"
          },
          {
            "object_id": "t2",
            "name": "mangOHTemp",
            "type": "Float"
          },
          {
            "object_id": "ap2",
            "name": "mangOHPress",
            "type": "Float"
          }
        ]
      }
    ]
  }
};


storeEntity = entity => superagent.post(c.entityURL + '?options=keyValues')
  .send(entity)
  .set('Fiware-Service', 'graziot')
  .set('Authorization', `Bearer ${token}`)
  .set('Fiware-ServicePath','/');

storeEntities = nr => c.chunks(nr)
  .reduce((p,a) => p.then(()=> Promise.all(a.map(createEntity).map(storeEntity))).then(()=>delay(120)),Promise.resolve()).then(d => console.log("entities created"));
*/

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


createService = () =>
  Promise.resolve(console.log('Create Service: ' + iot_frontend_server + '/iot/services'))
    .then(() =>
      superagent.post(iot_frontend_server+'/iot/services')
        .send(services)
        .set('Fiware-Service', 'graziot')
        .set('Authorization', `Bearer ${token}`)
        .set('Fiware-ServicePath','/'))
    .then(r => console.log("Service Created!"))

/*
storeDevice = device =>
  superagent.post(c.idasAdminURL + '/iot/devices')
    .send(device)
    .set('Fiware-Service', 'graziot')
    .set('Authorization', `Bearer ${token}`)
    .set('Fiware-ServicePath','/')

delay = (ms) =>new Promise (res => setTimeout(res,ms));

storeDevices = nr => {
  console.log('Creating ' + nr + ' devices: ' + c.idasAdminURL + '/iot/devices');
  return c.chunks(nr)
    .reduce((p,a) => p.then(()=> Promise.all(a.map(createDevice).map(storeDevice)))
      .then(()=>delay(120)),Promise.resolve())
    .then(d => console.log("devices created"));
}

 */

createService()
  .then(() => console.log("DONE!"))
  .catch(err => console.log(err));
