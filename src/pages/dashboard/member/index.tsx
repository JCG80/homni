
import React from 'react';
import { DashboardLayout } from '@/components/dashboard';

const MemberDashboard: React.FC = () => {
  return (
    <DashboardLayout title="Member Dashboard">
      <h1 className="text-2xl font-bold mb-4">Member Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-medium text-lg">Welcome to your dashboard</h2>
          <p className="text-gray-600">Manage your account and services here</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberDashboard;
