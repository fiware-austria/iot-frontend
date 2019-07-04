import SensorValue from '../models/sensor-value';
import BaseCtrl from './base';
import {ISensorValueDocument} from '../models/types';

export default class SensorValueCtrl extends BaseCtrl<ISensorValueDocument> {
  model = SensorValue;
  projection = 'sensorId valueName value';

  process = (req, res ) => {
    const parts = req.body.split('|');
    if (parts.length === 0 || parts.length % 2 !== 0) {
      res.status(400).send({message: 'malformed payload'})
    } else {
      const name = req.query.i;
      const values = []
      for (let i = 0; i < parts.length - 1; i += 2) {
        values.push({
          sensorId: name,
          valueName: parts[i],
          value: parseFloat(parts[i + 1]),
          timestamp: Date.now()
        });
      }
      SensorValue.insertMany(values)
        .then(() => res.send({message: 'OK'}))
        .catch(err => res.status(500).send(err))
    }

  }
}
