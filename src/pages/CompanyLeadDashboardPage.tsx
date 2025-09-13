import { RequireAuth } from "@/components/auth/RequireAuth";
import { CompanyLeadDashboard } from "@/components/company/CompanyLeadDashboard";

export default function CompanyLeadDashboardPage() {
  return (
    <RequireAuth roles={['company']}>
      <CompanyLeadDashboard />
    </RequireAuth>
  );
}