
import { LeadInsertTest } from '../tests/LeadInsertTest';
import { LeadStatusUpdateTest } from '../tests/LeadStatusUpdateTest';
import { DistributionStrategyTest } from '../tests/components/DistributionStrategyTest';
import { CompanyProfilesTest } from '../tests/components/CompanyProfilesTest';
import { TestDataInserter } from '../tests/components/TestDataInserter';

export const LeadTestPage = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lead Testing</h1>
          <p className="text-gray-600 mt-2">Page for testing lead functionality</p>
        </div>
        <TestDataInserter />
      </div>

      <div className="space-y-6">
        <CompanyProfilesTest />
        <DistributionStrategyTest />
        <LeadInsertTest />
        <LeadStatusUpdateTest />
      </div>
    </div>
  );
};
