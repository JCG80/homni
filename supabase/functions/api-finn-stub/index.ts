import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();
    const method = req.method;
    const searchParams = url.searchParams;

    console.log(`Finn API stub called: ${method} ${action}`);

    // Log API request attempt
    const logData = {
      integration_id: '00000000-0000-0000-0000-000000000002', // Finn integration ID
      method,
      endpoint: `/api/finn/${action}`,
      status_code: 200,
      success: true,
      response_time_ms: Math.floor(Math.random() * 200) + 100,
      request_data: Object.fromEntries(searchParams.entries()),
      response_data: { mock: true, action }
    };

    await supabase.from('api_request_logs').insert(logData);

    let mockResponse = {};

    switch (action) {
      case 'search-properties':
        const mockProperties = Array.from({ length: 5 }, (_, i) => ({
          id: `finn_prop_${Date.now()}_${i}`,
          title: `Flott bolig på ${['Grünerløkka', 'Frogner', 'Majorstuen', 'Sagene', 'St. Hanshaugen'][i]}`,
          price: Math.floor(Math.random() * 10000000) + 3000000,
          size: Math.floor(Math.random() * 100) + 60,
          rooms: Math.floor(Math.random() * 4) + 2,
          address: `Testgate ${Math.floor(Math.random() * 100) + 1}, Oslo`,
          coordinates: {
            lat: 59.9139 + (Math.random() - 0.5) * 0.1,
            lng: 10.7522 + (Math.random() - 0.5) * 0.1
          },
          images: [`https://images.unsplash.com/photo-${1560448000000 + i}?w=800&h=600`],
          description: 'Mock eiendom fra Finn API stub. Klar for ekte data når API-nøkkel legges inn.',
          property_type: ['apartment', 'house', 'townhouse'][Math.floor(Math.random() * 3)],
          mock: true
        }));

        mockResponse = {
          results: mockProperties,
          total_count: 147,
          page: 1,
          per_page: 5,
          mock: true,
          ready_for_activation: true
        };
        break;

      case 'get-property':
        const propertyId = searchParams.get('id') || 'unknown';
        mockResponse = {
          id: propertyId,
          title: 'Flott 3-roms leilighet med balkong',
          price: 4500000,
          size: 82,
          rooms: 3,
          address: 'Testveien 123, 0001 Oslo',
          coordinates: { lat: 59.9139, lng: 10.7522 },
          description: 'Pen leilighet i rolige omgivelser. Mock data fra Finn API stub.',
          images: [
            'https://images.unsplash.com/photo-1560448000-4/w=800&h=600',
            'https://images.unsplash.com/photo-1560448001-5/w=800&h=600'
          ],
          property_type: 'apartment',
          year_built: 1995,
          energy_rating: 'C',
          facilities: ['balkong', 'heis', 'parkering'],
          contact: {
            name: 'Mock Megler AS',
            phone: '+47 123 45 678',
            email: 'post@mockmegler.no'
          },
          mock: true
        };
        break;

      case 'get-market-stats':
        mockResponse = {
          area: searchParams.get('area') || 'Oslo',
          period: '2024',
          stats: {
            avg_price_per_sqm: Math.floor(Math.random() * 20000) + 60000,
            median_price: Math.floor(Math.random() * 2000000) + 4000000,
            properties_sold: Math.floor(Math.random() * 200) + 150,
            avg_days_on_market: Math.floor(Math.random() * 30) + 25,
            price_change_percent: (Math.random() - 0.5) * 20
          },
          mock: true,
          ready_for_activation: true
        };
        break;

      default:
        mockResponse = {
          message: `Finn API stub endpoint: ${action}`,
          method,
          timestamp: new Date().toISOString(),
          mock: true,
          status: 'ready'
        };
    }

    return new Response(JSON.stringify(mockResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Finn API stub:', error);
    
    // Log error
    await supabase.from('api_request_logs').insert({
      integration_id: '00000000-0000-0000-0000-000000000002',
      method: req.method,
      endpoint: '/api/finn/error',
      status_code: 500,
      success: false,
      response_time_ms: 0,
      error_message: error.message
    });

    return new Response(JSON.stringify({ 
      error: error.message,
      mock: true,
      ready_for_activation: true 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});