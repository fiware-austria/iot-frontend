import {OneDocumentPerValueStrategy} from '../server/strategies/one-document-per-value-strategy';
import {StorageStrategy} from '../server/strategies/storageStrategy';
import {OneDocumentPerTransactionStrategy} from '../server/strategies/one-document-per-transaction-strategy';

const device = {
  device_id: 'Sensor1',
  entity_type: 'Room',
  entity_name: 'Room23',
  attributes: {}
};

describe('OneDocumentPerValueStrategy', () => {
  it('should initialize with an empty list', () => {
    const strategy: StorageStrategy = new OneDocumentPerTransactionStrategy().build(device, new Date());
    expect(strategy.getDocuments()).toHaveLength(1);
  });

  it('should create one document per value', () => {
    const now = new Date();
    const strategy = new OneDocumentPerTransactionStrategy().build(device, now);
    strategy.addAttribute('temperature', 23.4);
    strategy.addAttribute('location', {type: 'Point', coordinates: [31.2, 45.3]});
    expect(strategy.getDocuments()).toHaveLength(1);
    expect(strategy.getDocuments()[0]).toEqual({
      sensorId: 'Sensor1',
      entity_name: 'Room23',
      entity_type: 'Room',
      timestamp: now,
      temperature: 23.4,
      location: {type: 'Point', coordinates: [31.2, 45.3]}
    });
  });
});
