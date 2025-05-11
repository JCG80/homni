
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLoginTabsNavigation } from './hooks/useLoginTabsNavigation';
import { LoginTabContent } from './LoginTabContent';
import { User, Building } from 'lucide-react';

interface LoginTabsProps {
  defaultTab?: string;
}

export const LoginTabs = ({ defaultTab = 'private' }: LoginTabsProps) => {
  const { activeTab, handleTabChange } = useLoginTabsNavigation(defaultTab);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
      <TabsList className="grid w-full grid-cols-2 bg-card">
        <TabsTrigger value="private" className="flex items-center gap-1.5">
          <User className="h-4 w-4" />
          <span>Privatperson</span>
        </TabsTrigger>
        <TabsTrigger value="business" className="flex items-center gap-1.5">
          <Building className="h-4 w-4" />
          <span>Bedrift</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="private" className="mt-6">
        <LoginTabContent 
          title="Logg inn som privatperson"
          subtitle="Velkommen tilbake til Homni"
          userType="private"
        />
      </TabsContent>
      
      <TabsContent value="business" className="mt-6">
        <LoginTabContent 
          title="Logg inn som bedrift"
          subtitle="Logg inn på din bedriftskonto hos Homni"
          userType="business"
        />
      </TabsContent>
    </Tabs>
  );
};
