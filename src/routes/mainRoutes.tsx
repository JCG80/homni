import React from 'react';
import { Route } from 'react-router-dom';

// Simple homepage component
const HomePage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Homni Platform</h1>
    <p className="text-muted-foreground mt-2">Welcome to your platform dashboard</p>
  </div>
);

// Login page component  
const LoginPage = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Login</h1>
    <p className="text-muted-foreground mt-2">Please log in to access your account</p>
  </div>
);

export const mainRoutes = [
  <Route key="home" path="/" element={<HomePage />} />,
  <Route key="login" path="/login" element={<LoginPage />} />,
];