// src/app/asset-management/assignments/page.jsx
import { Suspense } from "react";
import AssignmentsContent from "./AssignmentsContent";

export default function AssignmentsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><span className="text-gray-400 text-sm">Loading…</span></div>}>
      <AssignmentsContent />
    </Suspense>
  );
}