
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HeaderProps {
  activeTab: string;
  handleTabChange: (value: string) => void;
}

export const Header = ({ activeTab, handleTabChange }: HeaderProps) => {
  const navigate = useNavigate();
  
  const goToLogin = () => {
    navigate(activeTab === 'business' ? '/login?type=business' : '/login');
  };

  return (
    <header className="bg-white shadow-sm py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-primary">
          Homni
        </Link>
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/strom" className="text-gray-600 hover:text-primary">
            Strøm
          </Link>
          <Link to="#" className="text-gray-600 hover:text-primary">
            Bredbånd
          </Link>
          <Link to="#" className="text-gray-600 hover:text-primary">
            Mobilabonnement
          </Link>
          <Link to="#" className="text-gray-600 hover:text-primary">
            Forsikring
          </Link>
        </nav>
        
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
          
          <Button variant="outline" onClick={goToLogin}>
            Logg inn
          </Button>
        </div>
      </div>
    </header>
  );
};
