
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/modules/auth/components/LoginForm';

interface LoginTabsProps {
  defaultTab?: string;
}

export const LoginTabs = ({ defaultTab = 'private' }: LoginTabsProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const typeParam = searchParams.get('type');
  const [activeTab, setActiveTab] = useState<string>(typeParam === 'business' ? 'business' : defaultTab);

  useEffect(() => {
    if (typeParam === 'business') {
      setActiveTab('business');
    } else {
      setActiveTab('private');
    }
  }, [typeParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/login${value === 'business' ? '?type=business' : ''}`, { replace: true });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
      <TabsList className="grid w-full grid-cols-2 bg-white">
        <TabsTrigger value="private">Privatperson</TabsTrigger>
        <TabsTrigger value="business">Bedrift</TabsTrigger>
      </TabsList>
      
      <TabsContent value="private" className="mt-6">
        <h1 className="text-3xl font-bold">Logg inn som privatperson</h1>
        <p className="text-muted-foreground mt-2">
          Velkommen tilbake til Homni
        </p>
        
        <LoginForm redirectTo="/dashboard" userType="private" />
      </TabsContent>
      
      <TabsContent value="business" className="mt-6">
        <h1 className="text-3xl font-bold">Logg inn som bedrift</h1>
        <p className="text-muted-foreground mt-2">
          Logg inn på din bedriftskonto hos Homni
        </p>
        
        <LoginForm redirectTo="/dashboard" userType="business" />
      </TabsContent>
    </Tabs>
  );
};
