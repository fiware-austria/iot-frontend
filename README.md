# Alternative FIWARE IoT-Frontend [![MIT license](http://img.shields.io/badge/license-MIT-lightgrey.svg)](http://opensource.org/licenses/MIT)

This project aims at providing a high-performance alternative to FIWARE components IDAS and Cygnus.

The idea is to receive sensor values using ultralight protocol and besides sending them to ORION to 
directly storing them as time series data in a mongo database.

The project is currently in a very early stage. Documentation will be coming soon.

# Device Management

In this section you will find information about how to register a _Service_ and how to 
register a _Device_

## Registering a Service

The end-point for registering a service is:

`http://<iot-server>:<iot-port>/iot/services` 

By sending a message like the following using `POST`, a new service will be created:

```json
{
    'apikey': `myAPI`,
    'token': 'myToken',
    'entity_type': 'my_entity_type',
    'resource': '/iot/d'
  }
```

Sending a `GET` request will get you a list of all registered services

## Registering a Device

The corresponding REST end-point is:

`http://<iot-server>:<iot-port>/iot/devives`

In order to register a new device use a payload like the following:

```json
{
    'device_id': `my_sensor`,
    'entity_name': `MyRoom12`,
    'entity_type': 'my_entity_type',
    'timezone': 'Europe/Vienna',
    'attributes': [
      {
        'object_id': 't',
        'name': 'temperature',
        'type': 'Float'
      },
      {
        'object_id': 'h',
        'name': 'humidity',
        'type': 'Float'
      },
      {
        'object_id': 'pm25',
        'name': 'pm25',
        'type': 'Int'
      },
      {
        'object_id': 'pm10',
        'name': 'pm10',
        'type': 'Int'
      },
      {
        'object_id': 'ap',
        'name': 'airPressure',
        'type': 'Float'
      }
    ]
  }
```

The following data types are supported and used to convert to incoming Ultralight text message
into a value of the corresponding JavaScript type:

* Int/Integer
* Float
* String
* Date
* Location (expects a comma separated pair of float values (e.g. "43.223,56.443") that will
be translated into a GeoJSON `Point` type) 


# Developer Documentation

Developer documentation can be found [here](./delelop.md).
