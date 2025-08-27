import React from 'react';
import { Route } from 'react-router-dom';

// Documentation component
const Documentation = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Documentation</h1>
    <p className="text-muted-foreground mt-2">Platform documentation and guides</p>
  </div>
);

export const docsRoutes = [
  <Route key="docs" path="/docs" element={<Documentation />} />,
];