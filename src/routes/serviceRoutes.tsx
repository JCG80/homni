import React from 'react';
import { Route } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';

// Services page component
const ServicesPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Services</h1>
    <p className="text-muted-foreground mt-2">Available platform services</p>
  </div>
);

export const serviceRoutes = [
  <Route 
    key="services" 
    path="/services" 
    element={
      <RequireAuth>
        <ServicesPage />
      </RequireAuth>
    } 
  />,
];