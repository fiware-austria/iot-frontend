# Developer Documentation

Check out the project from the [github repository](https://github.com/fiware-austria/iot-frontend).
It was originally developed with node version 12.5.0.

## Unit and Integration Tests

Before you can run the tests, you need to have a running mongoDB and 
an ORION context broker.
To minimize the setup effort, you can use the [`docker-compose.yml`](./test/docker-compose.yml) 
in the `test` directory, which will bring up these two components.

Start them with the following command (`docker` and `docker-compose` are required):

`docker-compose -f ./test/docker-compose.yml up`

### Running Tests

You can now run the tests by either using

`npm run test-srv`

or

`yarn test-srv`

### Configuration

The configuration used by the tests can be found in [`/.env.test`](.env.test)


