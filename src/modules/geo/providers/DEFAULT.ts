
import { AddressLookupProvider, AddressResult } from '../addressLookup';

const DummyProvider: AddressLookupProvider = {
  async search(query: string): Promise<AddressResult[]> {
    return [
      {
        street: 'Test Street',
        number: '1',
        postalCode: '0001',
        city: 'Test City',
        municipality: 'Test Municipality',
        country: 'XX',
        lat: 0,
        lng: 0,
      },
    ];
  },

  async reverse(lat: number, lng: number): Promise<AddressResult | null> {
    return {
      street: 'Reverse Street',
      number: '99',
      postalCode: '9999',
      city: 'Fallback City',
      municipality: 'Fallback Municipality',
      country: 'XX',
      lat,
      lng,
    };
  },
};

export default DummyProvider;
