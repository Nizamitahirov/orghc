// src/app/structure/settings/page.jsx
"use client";

import WorkforceSettings from '@/components/headcount/WorkforceSettings';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto">
        <WorkforceSettings />
      </div>
    </div>
  );
}