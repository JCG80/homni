import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Simple placeholder components to avoid missing import errors
const HomePage = () => <div className="p-6"><h1 className="text-2xl font-bold">Homni Platform</h1><p className="text-muted-foreground mt-2">Welcome to your platform dashboard</p></div>;
const LoginPage = () => <div className="p-6"><h1 className="text-2xl font-bold">Login</h1><p className="text-muted-foreground mt-2">Please log in to access your account</p></div>;
const NotFound = () => <div className="p-6"><h1 className="text-2xl font-bold">404 - Page Not Found</h1><p className="text-muted-foreground mt-2">The page you are looking for does not exist.</p></div>;

export function Shell() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-6">
        <Routes>
          {/* Simplified routes to avoid missing component errors */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}