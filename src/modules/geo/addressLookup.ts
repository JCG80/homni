
import { logger } from '@/utils/logger';

export interface AddressLookupProvider {
  search(query: string): Promise<AddressResult[]>;
  reverse(lat: number, lng: number): Promise<AddressResult | null>;
}

export interface AddressResult {
  street: string;
  number?: string;
  postalCode?: string;
  city?: string;
  municipality?: string;
  country: string;
  lat: number;
  lng: number;
}

export async function getAddressProvider(region: string): Promise<AddressLookupProvider> {
  try {
    const module = await import(`./providers/${region.toUpperCase()}.ts`);
    return module.default;
  } catch (error) {
    logger.warn(`Provider for region ${region} not found, using DEFAULT provider`, {
      module: 'addressLookup',
      region,
      error: error instanceof Error ? error.message : String(error)
    });
    const fallback = await import('./providers/DEFAULT.ts');
    return fallback.default;
  }
}
