'use client';
import { useState, useEffect } from "react";
import { User, ExternalLink, Sparkles, Award } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export default function ProfileCard({ account, userDetails }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('employee_id');
    if (stored) {
      setEmployeeId(stored);
    } else if (account?.employee?.id) {
      setEmployeeId(account.employee.id);
      localStorage.setItem('employee_id', account.employee.id);
    }
  }, [account]);

  const getUserInitials = () => {
    if (account?.first_name && account?.last_name)
      return `${account.first_name[0]}${account.last_name[0]}`.toUpperCase();
    if (account?.name) {
      const parts = account.name.split(' ');
      return parts.length > 1
        ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
        : parts[0][0].toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (account?.name) return account.name;
    if (account?.first_name && account?.last_name) return `${account.first_name} ${account.last_name}`;
    return 'User';
  };

  const handleViewProfile = (e) => {
    e.preventDefault();
    const id = employeeId || localStorage.getItem('employee_id');
    router.push(id ? `/structure/employee/${id}/` : '/dashboard');
  };

  const businessFunctionCode = userDetails?.employee?.business_function_detail?.code?.toUpperCase();
  const isUK = businessFunctionCode === 'UK' || !!userDetails?.is_uk_scoped_admin;
  const isProfileActive = pathname.includes('/structure/employee/') && employeeId && pathname.includes(employeeId);

  const linkBtn = "w-full mb-2 bg-gradient-to-r from-almet-sapphire/10 to-almet-astral/10 dark:from-almet-steel-blue/10 dark:to-almet-san-juan/20 hover:from-almet-sapphire hover:to-almet-astral dark:hover:from-almet-steel-blue dark:hover:to-almet-astral text-almet-cloud-burst dark:text-white hover:text-white font-semibold py-2.5 rounded-xl text-[10px] transition-all flex items-center justify-center gap-2";

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/60 dark:from-almet-cloud-burst dark:to-almet-cloud-burst/95 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-almet-san-juan">
      <div className="h-20 bg-gradient-to-br from-almet-sapphire via-almet-astral to-almet-steel-blue relative overflow-hidden">
        {/* shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
      <div className="px-5 pb-5 text-center">
        <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-almet-sapphire to-almet-astral text-white flex items-center justify-center font-bold text-xl shadow-md -mt-8 mx-auto border-4 border-white dark:border-almet-cloud-burst ring-2 ring-almet-sapphire/20">
          {getUserInitials()}
        </div>
        <h3 className="text-sm font-bold text-almet-cloud-burst dark:text-white mt-3 mb-3">{getUserName()}</h3>

        <button
          onClick={handleViewProfile}
          className={`w-full mb-2 font-semibold py-2.5 rounded-xl text-[10px] transition-all flex items-center justify-center gap-2 ${
            isProfileActive
              ? 'bg-[#5975af] text-white shadow-md'
              : 'bg-gradient-to-r from-almet-sapphire/10 to-almet-astral/10 dark:from-almet-steel-blue/10 dark:to-almet-san-juan/20 hover:from-almet-sapphire hover:to-almet-astral dark:hover:from-almet-steel-blue dark:hover:to-almet-astral text-almet-cloud-burst dark:text-white hover:text-white'
          }`}
        >
          <User className="h-3 w-3" /> View Full Profile
        </button>

        <button onClick={() => window.open('https://almettrading.com/', '_blank')} className={linkBtn}>
          <ExternalLink className="h-3 w-3" /> Almet Groups Website
        </button>

        {isUK && (
          <div className="flex flex-col gap-1.5">
            <button onClick={() => window.open('https://portal.zhooshbenefits.co.uk/login', '_blank')} className={linkBtn.replace('mb-2 ', '')}>
              <Sparkles className="h-3 w-3" /> Zhoosh Profile
            </button>
            <button onClick={() => window.open('https://www.IMHRplusprivilege.co.uk', '_blank')} className={linkBtn.replace('mb-2 ', '')}>
              <Award className="h-3 w-3" /> IMHRplus Privilege
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
