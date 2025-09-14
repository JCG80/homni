
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileInfo } from '../components/ProfileInfo';
import { UserProperties } from '../components/UserProperties';

export const ProfilePage = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-lg text-gray-600">Ingen profil funnet.</p>
          <Button 
            onClick={() => navigate('/login')} 
            className="mt-4"
          >
            Logg inn
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-8 p-4">
      <h1 className="text-3xl font-bold mb-6">Min profil</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profilinformasjon</TabsTrigger>
          <TabsTrigger value="properties">Mine eiendommer</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <ProfileInfo />
        </TabsContent>
        
        <TabsContent value="properties">
          <UserProperties />
        </TabsContent>
      </Tabs>
    </div>
  );
};
