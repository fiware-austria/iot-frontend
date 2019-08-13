"use strict";
exports.__esModule = true;
var querystring = require("querystring");
var superagent = require("superagent");
var iot_frontend_server = 'http://localhost:3000';
var devices_1 = require("./devices");
var token = "";
var createDevices = function () {
    return superagent.post(iot_frontend_server + '/iot/devices')
        .send({ devices: devices_1.devices })
        .set('Fiware-Service', 'graziot')
        .set('Authorization', "Bearer " + token)
        .set('Fiware-ServicePath', '/');
};
var services = {
    "services": [
        {
            "apikey": "apistatic",
            "entity_type": "static",
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
var createService = function () {
    return Promise.resolve(console.log('Create Service: ' + iot_frontend_server + '/iot/services'))
        .then(function () {
        return superagent.post(iot_frontend_server + '/iot/services')
            .send(services)
            .set('Fiware-Service', 'graziot')
            .set('Authorization', "Bearer " + token)
            .set('Fiware-ServicePath', '/');
    })
        .then(function (r) { return console.log("Service Created!"); });
};
Promise.resolve()
    .then(createService)
    .then(createDevices)
    .then(function () { return console.log("DONE!"); })["catch"](function (err) { return console.log(err); });
