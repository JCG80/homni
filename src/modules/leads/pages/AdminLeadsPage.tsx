
import React, { useState } from 'react';
import { AdminNavigation } from '@/modules/admin/components/AdminNavigation';

// Update the LeadsTabs import to accept activeTab prop if it doesn't already
interface LeadsTabsProps {
  activeTab?: string;
}

const LeadsTabs = (props: LeadsTabsProps) => {
  // Implementation would go here
  return <div>Leads Tabs Component</div>;
};

export default function AdminLeadsPage() {
  const [activeTab, setActiveTab] = useState('all');
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Lead Administration</h1>
      <AdminNavigation />
      
      <div className="mt-6">
        <LeadsTabs activeTab={activeTab} />
      </div>
    </div>
  );
}

// Add a named export for routes that expect it
export { AdminLeadsPage };
