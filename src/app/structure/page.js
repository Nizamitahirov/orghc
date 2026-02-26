"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ComingSoon from "@/components/common/ComingSoon";
import { useTheme } from "@/components/common/ThemeProvider";

export default function Structure() {
  const { darkMode } = useTheme();

  return (
    <DashboardLayout>
      <ComingSoon darkMode={darkMode} />
    </DashboardLayout>
  );
}
