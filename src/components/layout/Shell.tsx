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
import { contentEditorRoutes } from '@/routes/contentEditorRoutes';

// Unauthorized page component
const UnauthorizedPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Unauthorized</h1>
    <p className="text-muted-foreground mt-2">You don't have permission to access this page.</p>
  </div>
);

// 404 not found component  
const NotFound = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
    <p className="text-muted-foreground mt-2">The page you are looking for does not exist.</p>
  </div>
);

export function Shell() {
  return (
    <Routes>
      {/* Public routes */}
      {mainRoutes}
      
      {/* Authenticated routes by role */}
      {userRoutes}
      {companyRoutes}
      {adminRoutes}
      {contentEditorRoutes}
      {leadRoutes}
      {docsRoutes}
      {serviceRoutes}
      {marketplaceRoutes}
      
      {/* Error routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}