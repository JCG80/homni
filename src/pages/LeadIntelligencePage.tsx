import { RequireAuth } from "@/components/auth/RequireAuth";
import { LeadIntelligenceDashboard } from "@/modules/lead-intelligence/components/LeadIntelligenceDashboard";

export default function LeadIntelligencePage() {
  return (
    <RequireAuth roles={['admin', 'master_admin', 'company']}>
      <LeadIntelligenceDashboard />
    </RequireAuth>
  );
}