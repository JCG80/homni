
import { AddressLookupProvider, AddressResult } from '../addressLookup';
import { logger } from '@/utils/logger';

const kartverketBaseUrl = 'https://ws.geonorge.no/adresser/v1';

const NorwegianProvider: AddressLookupProvider = {
  async search(query: string): Promise<AddressResult[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(`${kartverketBaseUrl}/sok?sok=${encodedQuery}&treffPerSide=10`);
      
      if (!response.ok) {
        throw new Error(`Search request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Map the Kartverket API response to our AddressResult type
      return data.adresser.map((address: any) => ({
        street: address.adressenavn || '',
        number: address.nummer || '',
        postalCode: address.postnummer || '',
        city: address.poststed || '',
        municipality: address.kommunenavn || '',
        country: 'NO',
        lat: parseFloat(address.representasjonspunkt?.lat || 0),
        lng: parseFloat(address.representasjonspunkt?.lon || 0),
      }));
    } catch (error) {
      logger.error('Error in Norwegian address search:', {
        module: 'NorwegianProvider',
        action: 'search',
        query
      }, error as Error);
      // Return empty array instead of throwing to prevent breaking the UI
      return [];
    }
  },
  
  async reverse(lat: number, lng: number): Promise<AddressResult | null> {
    try {
      const response = await fetch(
        `${kartverketBaseUrl}/reverse?lat=${lat}&lon=${lng}&radius=150`
      );
      
      if (!response.ok) {
        throw new Error(`Reverse lookup failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.adresser || data.adresser.length === 0) {
        return null;
      }
      
      const address = data.adresser[0];
      
      return {
        street: address.adressenavn || '',
        number: address.nummer || '',
        postalCode: address.postnummer || '',
        city: address.poststed || '',
        municipality: address.kommunenavn || '',
        country: 'NO',
        lat: parseFloat(address.representasjonspunkt?.lat || lat),
        lng: parseFloat(address.representasjonspunkt?.lon || lng),
      };
    } catch (error) {
      logger.error('Error in Norwegian reverse geocoding:', {
        module: 'NorwegianProvider',
        action: 'reverse',
        lat,
        lng
      }, error as Error);
      return null;
    }
  },
};

export default NorwegianProvider;
