import React from 'react';
import { Dashboard } from './Dashboard';

/**
 * DashboardPage wrapper component for the main route objects
 * Uses the existing Dashboard component that handles role-based redirection
 */
const DashboardPage: React.FC = () => {
  return <Dashboard />;
};

export default DashboardPage;