'use client';

import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import TaskManagement from '@/components/task-management/TaskManagement';

export default function TaskManagementPage() {
  return (
    <DashboardLayout>
      <TaskManagement />
    </DashboardLayout>
  );
}