"use client";
import { Suspense } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HeadcountTable from "@/components/headcount/HeadcountTable";

function HeadcountContent() {
  return <HeadcountTable />;
}

export default function HeadcountPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div></div>}>
        <HeadcountContent />
      </Suspense>
    </DashboardLayout>
  );
}
