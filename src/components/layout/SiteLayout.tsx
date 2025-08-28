import React, { useState } from 'react';
import { Header } from './Header';

interface SiteLayoutProps {
  children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  const [activeTab, setActiveTab] = useState('private');

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        activeTab={activeTab}
        handleTabChange={handleTabChange}
      />
      {children}
    </div>
  );
}