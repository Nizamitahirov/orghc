'use client';
import Link from "next/link";
import { Zap, Network, UsersRound, FileText, BarChart2, ScrollText, Layers, Activity, List, Brain, FileSignature, GraduationCap, LogOut, Calendar, Repeat, PlaneTakeoff, AlarmClock, Megaphone, PartyPopper, Boxes, UserCog } from "lucide-react";

const SYSTEMS = [
  {
    category: 'STRUCTURE',
    items: [
      { icon: Network,       label: 'Org Structure',    path: '/structure/org-structure' },
      { icon: UsersRound,    label: 'Headcount',        path: '/structure/headcount-table',  roles: ['admin', 'manager'] },
      { icon: FileText,      label: 'Job Descriptions', path: '/structure/job-descriptions', roles: ['admin', 'manager'] },
      { icon: BarChart2,     label: 'Competency Matrix',path: '/structure/comp-matrix' },
      { icon: ScrollText,    label: 'Job Catalog',      path: '/structure/job-catalog',      roles: ['admin'] },
      { icon: Layers,        label: 'Grading System',   path: '/structure/grading',          roles: ['admin'] },
    ],
  },
  {
    category: 'EFFICIENCY',
    items: [
      { icon: Activity,      label: 'Performance',      path: '/efficiency/performance-mng' },
      { icon: List,          label: 'Tasks Mng',        path: '/efficiency/tasks' },
      { icon: Brain,         label: 'Skills Matrix',    path: '/efficiency/self-assessment', roles: ['admin'] },
      { icon: FileSignature, label: 'Contracts',        path: '/efficiency/contracts',       roles: ['admin', 'manager'] },
    ],
  },
  {
    category: 'TRAINING',
    items: [
      { icon: GraduationCap, label: 'Training',         path: '/training' },
    ],
  },
  {
    category: 'REQUESTS',
    items: [
      { icon: LogOut,        label: 'Resignation',      path: '/requests/resignation',      roles: ['admin'] },
      { icon: Calendar,      label: 'Vacation',         path: '/requests/vacation' },
      { icon: Repeat,        label: 'Handover',         path: '/requests/handover-takeover' },
      { icon: PlaneTakeoff,  label: 'Business Trip',    path: '/requests/business-trip' },
      { icon: AlarmClock,    label: 'Time Off',         path: '/requests/time-off' },
    ],
  },
  {
    category: 'COMMUNICATION',
    items: [
      { icon: Megaphone,     label: 'Company News',     path: '/communication/company-news' },
      { icon: PartyPopper,   label: 'Celebrations',     path: '/communication/celebrations' },
    ],
  },
  {
    category: 'SETTINGS',
    items: [
      { icon: Boxes,         label: 'Asset Management', path: '/settings/asset-mng',  roles: ['admin'] },
      { icon: UserCog,       label: 'Role Management',  path: '/settings/role-mng',   roles: ['admin'] },
    ],
  },
];

export default function EnterpriseSystemsHub({ userRole }) {
  const visibleItems = SYSTEMS.flatMap(s => s.items).filter(item => !item.roles || item.roles.includes(userRole));

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-2xl p-6 shadow-lg border border-almet-mystic dark:border-almet-san-juan">
      <div className="flex items-center mb-5">
        <h3 className="font-bold text-base text-almet-cloud-burst dark:text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-almet-sapphire dark:text-almet-steel-blue" /> Enterprise Systems
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {visibleItems.map((item, i) => (
          <Link key={i} href={item.path}>
            <div className="group relative bg-almet-mystic/20 dark:bg-almet-san-juan/20 hover:bg-almet-sapphire/10 dark:hover:bg-almet-steel-blue/10 border border-almet-mystic/50 dark:border-almet-san-juan/50 hover:border-almet-sapphire/50 dark:hover:border-almet-steel-blue/50 rounded-xl p-3 transition-all duration-300 cursor-pointer hover:shadow-md">
              <div className="w-8 h-8 rounded-xl bg-almet-sapphire/10 dark:bg-almet-steel-blue/10 group-hover:bg-almet-sapphire dark:group-hover:bg-almet-steel-blue flex items-center justify-center mb-3 transition-all duration-300">
                <item.icon className="h-4 w-4 text-almet-sapphire dark:text-almet-steel-blue group-hover:text-white transition-colors" />
              </div>
              <p className="text-xs font-semibold text-almet-cloud-burst dark:text-white leading-tight">{item.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
