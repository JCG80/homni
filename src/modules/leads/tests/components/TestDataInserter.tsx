
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

export const TestDataInserter = () => {
  const [loading, setLoading] = useState(false);

  const insertTestCompany = async () => {
    setLoading(true);
    try {
      // Using type assertion to avoid TypeScript errors until Supabase types are updated
      const { data, error } = await (supabase
        .from('company_profiles') as any)
        .insert([
          {
            user_id: '3997d892-10e9-4325-a11e-102c22ec689e',
            name: 'Testfirma AS',
            status: 'active',
            tags: ['Elektriker', 'Rørlegger']
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast({
        title: 'Test data inserted',
        description: 'Test company profile has been added successfully',
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Error inserting test data:', error);
      toast({
        title: 'Error inserting test data',
        description: error.message || 'An unknown error occurred',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={insertTestCompany} 
      disabled={loading}
    >
      {loading ? 'Inserting...' : 'Insert Test Company'}
    </Button>
  );
};
