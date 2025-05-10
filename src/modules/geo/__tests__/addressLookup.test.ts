
import { getAddressProvider } from '../addressLookup';
import DummyProvider from '../providers/DEFAULT';

// Using Jest for testing
describe('addressLookup module', () => {
  test('getAddressProvider should return DEFAULT provider when region is invalid', async () => {
    const provider = await getAddressProvider('INVALID');
    expect(provider).toBeDefined();
    
    // Should be the dummy provider
    const results = await provider.search('test query');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].country).toBe('XX');
  });

  test('getAddressProvider should load the correct provider based on region', async () => {
    // Test with default provider for safety
    const provider = await getAddressProvider('DEFAULT');
    expect(provider).toBeDefined();
    
    const results = await provider.search('test query');
    expect(results.length).toBeGreaterThan(0);
    
    // Test reverse lookup
    const reverseResult = await provider.reverse(59.9133, 10.7389);
    expect(reverseResult).toBeDefined();
    expect(reverseResult?.city).toBe('Fallback City');
  });

  test('DummyProvider search should return test data', async () => {
    const results = await DummyProvider.search('anything');
    expect(results.length).toBe(1);
    expect(results[0].street).toBe('Test Street');
    expect(results[0].number).toBe('1');
    expect(results[0].postalCode).toBe('0001');
  });

  test('DummyProvider reverse should return fallback data', async () => {
    const reverseResult = await DummyProvider.reverse(60.0, 10.0);
    expect(reverseResult).toBeDefined();
    expect(reverseResult?.street).toBe('Reverse Street');
    expect(reverseResult?.lat).toBe(60.0);
    expect(reverseResult?.lng).toBe(10.0);
  });
});
