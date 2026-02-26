// src/app/structure/headcount-table/page.jsx - UPDATE
"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HeadcountWrapper from "@/components/headcount/HeadcountWrapper";
import HeadcountAccessControl from "@/components/headcount/HeadcountAccessControl";

export default function HeadcountPage() {
  return (
    <DashboardLayout>
    
        <HeadcountAccessControl>
          <HeadcountWrapper />
        </HeadcountAccessControl>
   
    </DashboardLayout>
  );
}