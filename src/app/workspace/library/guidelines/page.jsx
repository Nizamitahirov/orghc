// app/workspace/library/guidelines/page.jsx
// This page finds "General" company and "Guidelines" folder, then redirects

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { documentService } from "@/services/documentService";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useToast } from "@/components/common/Toast";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function GuidelinesRedirect() {
  const router = useRouter();
  const { showError } = useToast();

  useEffect(() => {
    findAndRedirect();
  }, []);

  const findAndRedirect = async () => {
    try {
      // 1. Get all companies
      const companiesData = await documentService.getCompanies();
      const companiesList = Array.isArray(companiesData) 
        ? companiesData 
        : (companiesData.results || []);
      
      // 2. Find "General" company (case insensitive)
      const generalCompany = companiesList.find(
        c => c.name.toLowerCase().includes('general') || c.code.toLowerCase() === 'gen'
      );
      
      if (!generalCompany) {
        showError('General company not found. Please create it first.');
        router.push('/workspace/library');
        return;
      }

      // 3. Get folders for General company
      const foldersData = await documentService.getCompanyFolders(generalCompany.id);
      
      // 4. Find "Guidelines" folder (case insensitive)
      const guidelinesFolder = foldersData.find(
        f => f.name.toLowerCase().includes('guideline')
      );
      
      if (!guidelinesFolder) {
        showError('Guidelines folder not found. Please create it in General company.');
        router.push(`/workspace/library/company/${generalCompany.id}`);
        return;
      }

      // 5. Redirect to Guidelines folder
      router.push(`/workspace/library/folder/${guidelinesFolder.id}`);
      
    } catch (error) {
      console.error('Error finding guidelines:', error);
      showError('Failed to find guidelines folder');
      router.push('/workspace/library');
    }
  };

  return (
    <DashboardLayout>
      <LoadingSpinner message="Redirecting to Guidelines..." />
    </DashboardLayout>
  );
}