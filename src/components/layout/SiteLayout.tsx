import React from 'react';
import { Header } from './Header';

interface SiteLayoutProps {
  children: React.ReactNode;
}

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      {children}
    </div>
  );
}