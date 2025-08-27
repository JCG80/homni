import React from 'react';
import { Route } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';

// Marketplace component
const Marketplace = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Marketplace</h1>
    <p className="text-muted-foreground mt-2">Browse marketplace offerings</p>
  </div>
);

export const marketplaceRoutes = [
  <Route 
    key="marketplace" 
    path="/marketplace" 
    element={
      <RequireAuth>
        <Marketplace />
      </RequireAuth>
    } 
  />,
];