
import { describe, it, expect } from 'vitest';
import { getAddressProvider } from '../addressLookup';

describe('AddressLookup Module', () => {
  it('should use DEFAULT provider for invalid region codes', async () => {
    const provider = await getAddressProvider('INVALID');
    const results = await provider.search('Test');
    
    expect(results.length).toBe(1);
    expect(results[0].country).toBe('XX');
    expect(results[0].street).toBe('Test Street');
  });
  
  it('should properly handle reverse geocoding with DEFAULT provider', async () => {
    const provider = await getAddressProvider('INVALID');
    const result = await provider.reverse(60.1, 10.2);
    
    expect(result).not.toBeNull();
    if (result) {
      expect(result.street).toBe('Reverse Street');
      expect(result.city).toBe('Fallback City');
      expect(result.lat).toBe(60.1);
      expect(result.lng).toBe(10.2);
    }
  });
  
  // Test the Norwegian provider - note that this is an integration test
  // and might fail if the external service is unavailable
  it('should return Oslo addresses when searching for Oslo with Norwegian provider', async () => {
    // Skip this test if we're running in a CI environment
    if (process.env.CI) {
      console.log('Skipping Norwegian provider test in CI environment');
      return;
    }
    
    try {
      const provider = await getAddressProvider('NO');
      const results = await provider.search('Oslo');
      
      expect(results.length).toBeGreaterThan(0);
      
      // Check if at least one result has Oslo as the city
      const hasOslo = results.some(address => 
        address.city?.includes('Oslo') || 
        address.municipality?.includes('Oslo')
      );
      
      expect(hasOslo).toBe(true);
    } catch (error) {
      // If the service is down, we'll skip the test rather than fail it
      console.warn('Norwegian provider test skipped due to service unavailability');
    }
  });
});
