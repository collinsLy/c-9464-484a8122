
import React from 'react';
import DashboardLayout from './DashboardLayout';

export default function TestDashboard() {
  return (
    <DashboardLayout>
      <div className="p-4 text-white">
        <h1 className="text-2xl font-bold">Test Dashboard</h1>
        <p>This is a test to verify that DashboardLayout works correctly.</p>
      </div>
    </DashboardLayout>
  );
}
