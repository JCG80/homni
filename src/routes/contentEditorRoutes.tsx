import React from 'react';
import { Route } from 'react-router-dom';
import { RequireAuth } from '@/components/auth/RequireAuth';

// Content Editor dashboard component
const ContentEditorDashboard = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Content Editor Dashboard</h1>
    <p className="text-muted-foreground mt-2">Welcome to your content editor dashboard</p>
  </div>
);

export const contentEditorRoutes = [
  <Route 
    key="content-editor-dashboard" 
    path="/dashboard/content-editor" 
    element={
      <RequireAuth roles={['content_editor']}>
        <ContentEditorDashboard />
      </RequireAuth>
    } 
  />,
];