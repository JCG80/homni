
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadInsertTest } from '../tests/LeadInsertTest';
import { LeadStatusUpdateTest } from '../tests/LeadStatusUpdateTest';
import { StatusTransitionTest } from '../tests/components/StatusTransitionTest';

export const LeadTestPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Lead Testing</h1>
      
      <Tabs defaultValue="insert">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insert">Insert Lead Tests</TabsTrigger>
          <TabsTrigger value="status">Status Update Tests</TabsTrigger>
          <TabsTrigger value="transition">Status Transition Rules</TabsTrigger>
        </TabsList>
        <TabsContent value="insert" className="mt-6">
          <LeadInsertTest />
        </TabsContent>
        <TabsContent value="status" className="mt-6">
          <LeadStatusUpdateTest />
        </TabsContent>
        <TabsContent value="transition" className="mt-6">
          <StatusTransitionTest />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeadTestPage;
