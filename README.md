# Alternative FIWARE IoT-Frontend [![MIT license](http://img.shields.io/badge/license-MIT-lightgrey.svg)](http://opensource.org/licenses/MIT)

This project aims at providing a high-performance alternative to FIWARE components IDAS and Cygnus.

The idea is to receive sensor values using ultralight protocol and besides sending them to ORION to 
directly storing them as time series data in a mongo database.

The project is currently in a very early stage. Documentation will be coming soon.

# Configuration

Currently this project use [`dotenv`](https://github.com/motdotla/dotenv#readme) for configuration.
Thus, all configuration information needs to go into a file called `.env` containing key/Value pairs.

Here's a demo configuration


```
  MONGODB_URI=mongodb://mongo.mydomain.org:27017/iot-frontend
  STH_PREFIX=sth_
  # Storage Strategy: ONE_DOCUMENT_PER_VALUE / ONE_DOCUMENT_PER_TRANSACTION
  STORAGE_STRATEGY=ONE_DOCUMENT_PER_TRANSACTION
  ORION_ENDPOINT=http://orion:1026
  ORION_UPDATE_INTERVAL=30
  ORION_ENABLED=true
  ORION_CHUNKSIZE=200
  # Log levels are: debug, info, warn (default), error
  LOG_LEVEL=debug 
```

And here's the meaning of each option:

| Key                     | Meaning                                                                                                                                                                                                                                                            |
|-------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `MONGODB_URI`           | Connection URI to the MongoDB where configuration and timeseries information will be stored                                                                                                                                                                        |
| `STH_PREFIX`            | Additional part of the created Mongo collection name. The collection name is created the following way:    `STH_PREFIX + '_' + fiware_service_name + '_' + entity_type`                                                                             |
| `STORAGE_STRATEGY`      | Either `ONE_DOCUMENT_PER_VALUE` or `ONE_DOCUMENT_PER_TRANSACTION` (see next section for details)                                                                                                                                                                   |
| `ORION_ENABLED`         | `true`/`false` defines whether data (only most current value) should be sent to ORION as well                                                                                                                                                                      |
| `ORION_ENDPOINT`        | URL of the context-broker ORION                                                                                                                                                                                                                                    |
| `ORION_UPDATE_INTERVAL` | Number in seconds that describes the interval between any to requests sent to ORION. With every  transmission only the most current value for each sensor is sent.                                                                                                 |
| `ORION_CHUNKSIZE`       | After the `ORION_UPDATE_INTERVAL` elapsed, the most recent samples for each sensor are sent as a batch update. Since this could result in an entity body that is to large, this option can be used to split-up  the payload into chunks no bigger than this number |
| `LOG_LEVEL`             | This project is using [`typescript-logging`](https://github.com/mreuvers/typescript-logging#readme).  Thus all log-levels supported by this library can be used (e.g.:debug, info, warn (default), error)                                                          |

## Storage Strategies

Like with FIWARE Cygnus, there exist several (=two) storage strategies that lead to different collection layout.
In any case, all data from sensors using the same [`entity_type`](https://telefonicaiotiotagents.docs.apiary.io/#reference/configuration-api/devices)
belonging to the same tenant (`Fiware-Service` header field) are stored in one collection, thus, there
is no separate collection per sensor.

### `ONE_DOCUMENT_PER_VALUE`

When using this strategy there will be one entry (=document) for each value contained in the
incoming Ultralight message.

For Example, a message like `t|15|k|abc` will result in the following two documents:

``` json
{
    sensorId: 'mySensor42',
    entity_type: 'Room',
    timestamp: <Current Time>,
    valueName: 'temperature',
    value: 15
}
{
    sensorId: 'mySensor42',
    entity_type: 'Room',
    timestamp: <Current Time>,
    valueName: 'someText',
    value: 'abc'
}
```

Fields `sensorID`, `entity_type`, and `valueName` are retrieved from the 
[device registration](https://telefonicaiotiotagents.docs.apiary.io/#reference/configuration-api/devices/create-a-device).
 
Please be aware, that the type of the value is created by parsing the incoming string according 
to the registered attribute's type.

### `ONE_DOCUMENT_PER_TRANSACTION`

When using this strategy (definitely the preferred one), only one document is created for the
entire Ultralight message:

 ``` json
 {
     sensorId: 'mySensor42',
     entity_type: 'Room',
     timestamp: <Current Time>,
     temperature: 15
     someText: 'abc'
 }
 ```

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
