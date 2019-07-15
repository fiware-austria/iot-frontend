import {OneDocumentPerValueStrategy} from '../server/strategies/one-document-per-value-strategy';
import {StorageStrategy} from '../server/strategies/storageStrategy';

const device = {
  device_id: 'Sensor1',
  entity_type: 'Room',
  entity_name: 'Room23',
  attributes: {}
};

describe('OneDocumentPerValueStrategy', () => {
    it('should initialize with an empty list', () => {
      const strategy: StorageStrategy = new OneDocumentPerValueStrategy(device, new Date());
      expect(strategy.getDocuments()).toHaveLength(0);
    });

    it('should create one object per value', () => {
      const now = new Date();
      const strategy = new OneDocumentPerValueStrategy(device, now);
      strategy.addAttribute('temperature', 23.4);
      strategy.addAttribute('location', {type: 'Point', coordinates: [31.2, 45.3]});
      expect(strategy.getDocuments()).toHaveLength(2);
      expect(strategy.getDocuments()[0]).toEqual({
        sensorId: 'Sensor1',
        entity_type: 'Room',
        timestamp: now,
        valueName: 'temperature',
        value: 23.4
      });
      expect(strategy.getDocuments()[1]).toEqual({
        sensorId: 'Sensor1',
        entity_type: 'Room',
        timestamp: now,
        valueName: 'location',
        value: {type: 'Point', coordinates: [31.2, 45.3]}
      });

    });
});
