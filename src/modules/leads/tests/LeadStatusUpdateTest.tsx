
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { updateLeadStatus } from '../api/lead-update';
import { Button } from '@/components/ui/button';
import { LEAD_STATUSES } from '../constants/lead-constants';
import { LeadStatus } from '@/types/leads-canonical';

export function LeadStatusUpdateTest() {
  const [loading, setLoading] = useState(false);

  async function testUpdate(status: LeadStatus) {
    setLoading(true);
    try {
      const result = await updateLeadStatus('test-lead-id', status);
      toast({
        title: 'Status Updated',
        description: `✅ Lead ble oppdatert til "${status}"`,
      });
    } catch (err) {
      toast({
        title: 'Update Failed',
        description: '🚫 Klarte ikke å oppdatere lead-status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">🔁 Test oppdatering av lead-status</h2>
      <div className="flex flex-wrap gap-2">
        {LEAD_STATUSES.map((status) => (
          <Button
            key={status}
            variant="outline"
            disabled={loading}
            onClick={() => testUpdate(status)}
          >
            Oppdater til "{status}"
          </Button>
        ))}
      </div>
      <Button
        className="mt-4"
        variant="secondary"
        onClick={async () => {
          try {
            const result = await updateLeadStatus(
              'db7e8d51-2a8d-4a8d-a3c5-d4e8ea551122',
              'converted' as LeadStatus
            );
            toast({
              title: 'Status Updated',
              description: '✅ Lead ble oppdatert til "converted"',
            });
          } catch (err) {
            toast({
              title: 'Update Failed',
              description: '🚫 Klarte ikke å oppdatere lead-status',
              variant: 'destructive',
            });
          }
        }}
      >
        Test "converted" status på known-lead
      </Button>
    </div>
  );
}

export default LeadStatusUpdateTest;
