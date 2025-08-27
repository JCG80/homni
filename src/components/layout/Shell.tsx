import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { mainRoutes } from '@/routes/mainRoutes';
import { userRoutes } from '@/routes/userRoutes';
import { companyRoutes } from '@/routes/companyRoutes';
import { adminRoutes } from '@/routes/adminRoutes';
import { leadRoutes } from '@/routes/leadRoutes';
import { docsRoutes } from '@/routes/docsRoutes';
import { serviceRoutes } from '@/routes/serviceRoutes';
import { marketplaceRoutes } from '@/routes/marketplaceRoutes';

export function Shell() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-6">
        <Routes>
          {/* Public routes */}
          {mainRoutes}
          
          {/* Authenticated routes by role */}
          {userRoutes}
          {companyRoutes}
          {adminRoutes}
          {leadRoutes}
          {docsRoutes}
          {serviceRoutes}
          {marketplaceRoutes}
        </Routes>
      </main>
    </div>
  );
}