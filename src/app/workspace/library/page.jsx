"use client";
import { Folder, FileText, Download, Eye, Search, Filter, Grid, List, BookOpen, Shield, Briefcase, Code, Palette } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { useTheme } from "@/components/common/ThemeProvider";
import Link from "next/link";

const FolderCard = ({ title, fileCount, icon: Icon, darkMode, href, color }) => {
  return (
    <Link href={href || "#"}>
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl p-5 shadow-lg border border-almet-mystic/50 dark:border-almet-san-juan/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer group">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="font-bold text-xs text-almet-cloud-burst dark:text-white mb-1 group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors">
          {title}
        </h3>
        <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai">
          {fileCount} {fileCount === 1 ? 'File' : 'Files'}
        </p>
      </div>
    </Link>
  );
};

const DocumentCard = ({ title, type, size, darkMode }) => {
  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-xl p-4 shadow-md border border-almet-mystic/50 dark:border-almet-san-juan/50 transition-all duration-300 hover:shadow-xl cursor-pointer group">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm">
          <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-xs text-almet-cloud-burst dark:text-white mb-0.5 group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors truncate">
            {title}
          </h4>
          <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-2">
            {type} • {size}
          </p>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 text-[10px] text-almet-sapphire dark:text-almet-steel-blue hover:bg-almet-sapphire/10 dark:hover:bg-almet-steel-blue/10 px-2 py-1 rounded-lg transition-all font-medium">
              <Eye className="h-3 w-3" />
              View
            </button>
            <button className="flex items-center gap-1 text-[10px] text-almet-sapphire dark:text-almet-steel-blue hover:bg-almet-sapphire/10 dark:hover:bg-almet-steel-blue/10 px-2 py-1 rounded-lg transition-all font-medium">
              <Download className="h-3 w-3" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickAccessCard = ({ title, description, href, icon: Icon, color, darkMode }) => {
  return (
    <Link href={href}>
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl p-4 shadow-lg border border-almet-mystic/50 dark:border-almet-san-juan/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-almet-cloud-burst dark:text-white mb-1 group-hover:text-almet-sapphire dark:group-hover:text-almet-steel-blue transition-colors">
              {title}
            </h4>
            <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function DocumentationLibrary() {
  const { darkMode } = useTheme();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('');

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";

  const folders = [
    { 
      title: 'HR Frameworks', 
      fileCount: 18, 
      icon: Briefcase, 
      href: '/communication/policy-documents?category=hr',
      color: 'bg-gradient-to-br from-blue-500 to-blue-600'
    },
    { 
      title: 'Legal Compliance', 
      fileCount: 9, 
      icon: Shield, 
      href: '/communication/policy-documents?category=legal',
      color: 'bg-gradient-to-br from-red-500 to-red-600'
    },
    { 
      title: 'Brand Guidelines', 
      fileCount: 12, 
      icon: Palette, 
      href: '/communication/policy-documents?category=brand',
      color: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    { 
      title: 'Security Manuals', 
      fileCount: 15, 
      icon: Shield, 
      href: '/communication/policy-documents?category=security',
      color: 'bg-gradient-to-br from-orange-500 to-orange-600'
    },
    { 
      title: 'IT Documentation', 
      fileCount: 24, 
      icon: Code, 
      href: '/communication/policy-documents?category=it',
      color: 'bg-gradient-to-br from-green-500 to-green-600'
    },
  ];

  const recentDocuments = [
    { title: 'Annual Report 2025', type: 'PDF', size: '4.5 MB' },
    { title: 'Employee Handbook 2025', type: 'PDF', size: '2.1 MB' },
    { title: 'Data Protection Policy', type: 'PDF', size: '1.8 MB' },
    { title: 'Code of Conduct', type: 'PDF', size: '950 KB' },
  ];

  const quickAccessItems = [
    {
      title: 'Company Policies',
      description: 'Browse all company policies and procedures',
      href: '/communication/policy-documents',
      icon: FileText,
      color: 'bg-gradient-to-br from-almet-sapphire to-almet-astral'
    },
    {
      title: 'Training Materials',
      description: 'Access learning resources and guides',
      href: '/training/my-trainings',
      icon: BookOpen,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600'
    },
    {
      title: 'Organization Info',
      description: 'Company structure and contacts',
      href: '/structure/org-chart',
      icon: Briefcase,
      color: 'bg-gradient-to-br from-green-500 to-green-600'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div>
          <h1 className={`text-xl font-bold ${textPrimary} mb-1`}>
            Knowledge Repository
          </h1>
          <p className={`${textSecondary} text-xs`}>
            Access company documents, policies, and resources
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className={`${bgCard} rounded-2xl p-4 shadow-lg border border-almet-mystic/50 dark:border-almet-san-juan/50`}>
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-almet-waterloo dark:text-almet-bali-hai" />
              <input
                type="text"
                placeholder="Search for documents, policies, guidelines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border ${borderColor} bg-almet-mystic/20 dark:bg-almet-san-juan/20 ${textPrimary} placeholder-almet-waterloo dark:placeholder-almet-bali-hai focus:outline-none focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-steel-blue transition-all`}
              />
            </div>
            
            <div className="flex gap-2">
              <button className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border border-almet-mystic/50 dark:border-almet-san-juan/50 ${textPrimary} hover:bg-almet-mystic/30 dark:hover:bg-almet-san-juan/30 transition-all`}>
                <Filter className="h-3.5 w-3.5" />
                <span className="font-semibold text-[10px]">Filter</span>
              </button>
              
              <div className="flex gap-1 bg-almet-mystic/30 dark:bg-almet-san-juan/30 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-almet-sapphire text-white shadow-lg'
                      : 'text-almet-waterloo dark:text-almet-bali-hai hover:bg-almet-mystic dark:hover:bg-almet-san-juan'
                  }`}
                >
                  <Grid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-almet-sapphire text-white shadow-lg'
                      : 'text-almet-waterloo dark:text-almet-bali-hai hover:bg-almet-mystic dark:hover:bg-almet-san-juan'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Folder Grid */}
        <div>
          <h2 className={`text-sm font-bold ${textPrimary} mb-4`}>Document Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {folders.map((folder, index) => (
              <FolderCard
                key={index}
                title={folder.title}
                fileCount={folder.fileCount}
                icon={folder.icon}
                darkMode={darkMode}
                href={folder.href}
                color={folder.color}
              />
            ))}
          </div>
        </div>

        {/* Recent Documents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-sm font-bold ${textPrimary}`}>Recent Documents</h2>
            <Link href="/communication/policy-documents" className="text-almet-sapphire dark:text-almet-steel-blue text-[10px] font-semibold hover:underline">
              View All Documents
            </Link>
          </div>
          
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' : 'space-y-3'}>
            {recentDocuments.map((doc, index) => (
              <DocumentCard
                key={index}
                title={doc.title}
                type={doc.type}
                size={doc.size}
                darkMode={darkMode}
              />
            ))}
          </div>
        </div>

        {/* Quick Access Links */}
        <div>
          <h3 className={`text-sm font-bold ${textPrimary} mb-4`}>Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickAccessItems.map((item, index) => (
              <QuickAccessCard
                key={index}
                title={item.title}
                description={item.description}
                href={item.href}
                icon={item.icon}
                color={item.color}
                darkMode={darkMode}
              />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}