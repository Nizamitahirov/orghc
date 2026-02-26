"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import HeadcountTable from "@/components/headcount/HeadcountTable";

export default function HeadcountPage() {
  return (
    <DashboardLayout>
      <HeadcountTable />
    </DashboardLayout>
  );
}
