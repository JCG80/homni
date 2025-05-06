
import { LeadSettingsForm } from '../components/LeadSettingsForm';
import { LeadSettingsTest } from '../tests/components/LeadSettingsTest';

export const LeadTestPage = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold">Lead Test Page</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Settings Form</h2>
          <LeadSettingsForm />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Settings Display</h2>
          <LeadSettingsTest />
        </div>
      </div>
    </div>
  );
};
