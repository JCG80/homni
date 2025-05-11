
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainNavigation } from './MainNavigation';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { UserNav } from './UserNav';

interface HeaderProps {
  activeTab: string;
  handleTabChange: (value: string) => void;
}

export const Header = ({ activeTab, handleTabChange }: HeaderProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const goToLogin = () => {
    navigate(activeTab === 'business' ? '/login?type=business' : '/login');
  };

  return (
    <header className="bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary">
          Homni
        </Link>
        
        {/* Main Navigation */}
        <MainNavigation />
        
        {/* Auth/User Section */}
        <div className="flex items-center space-x-4">
          <Tabs
            defaultValue="private"
            value={activeTab}
            onValueChange={handleTabChange}
          >
            <TabsList className="bg-transparent">
              <TabsTrigger value="private">Privatperson</TabsTrigger>
              <TabsTrigger value="business">Bedrift</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {isAuthenticated ? (
            <UserNav />
          ) : (
            <Button variant="outline" onClick={goToLogin}>
              Logg inn
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
