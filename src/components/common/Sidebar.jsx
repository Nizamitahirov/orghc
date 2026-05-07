"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  Network, UsersRound, BarChart2, ChevronRight, ChevronLeft, Home,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Sidebar = ({ collapsed = false, toggleSidebar, isPinned = false, togglePin }) => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    {
      type: "section",
      label: "Navigation",
    },
    {
      label: "Home",
      icon: <Home className="w-4 h-4" />,
      path: "/home",
      id: "home",
    },
    {
      type: "section",
      label: "Headcount",
    },
    {
      label: "Headcount Overview",
      icon: <BarChart2 className="w-4 h-4" />,
      path: "/headcount",
      id: "headcount",
    },
    {
      label: "Headcount Table",
      icon: <UsersRound className="w-4 h-4" />,
      path: "/structure/headcount-table",
      id: "headcount-table",
    },
    {
      type: "section",
      label: "Org Chart",
    },
    {
      label: "Org Structure",
      icon: <Network className="w-4 h-4" />,
      path: "/structure/org-structure",
      id: "org-structure",
    },
  ];

  return (
    <div className="h-full bg-white/90 dark:bg-almet-cloud-burst/95 backdrop-blur-xl border-r border-gray-200/60 dark:border-white/[0.07] flex flex-col w-full relative shadow-lg shadow-black/[0.04] dark:shadow-black/20">

      {/* Logo area */}
      <Link
        href="/"
        className={`flex items-center justify-center ${collapsed ? "" : "px-3"} py-2.5 border-b border-gray-200/60 dark:border-white/[0.07] group bg-gradient-to-r from-transparent via-almet-sapphire/[0.03] to-transparent dark:via-white/[0.02]`}
      >
        {collapsed ? (
          <div className="transform transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-md">
            <img src="/pdfs/logoSmall.png" alt="" className="h-6" />
          </div>
        ) : (
          <div className="flex items-center justify-center transform transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-md">
            <img src="/pdfs/logo.png" alt="Logo" className="h-6" />
          </div>
        )}
      </Link>

      {/* Pin/Unpin button */}
      <button
        onClick={togglePin}
        className="absolute -right-3 top-8 z-50 w-6 h-6 rounded-full bg-white/90 dark:bg-almet-cloud-burst/95 backdrop-blur-sm border border-almet-sapphire/40 dark:border-almet-steel-blue/40 flex items-center justify-center hover:scale-110 hover:border-almet-sapphire dark:hover:border-almet-steel-blue transition-all duration-200 shadow-md shadow-black/10 hover:shadow-almet-sapphire/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-almet-sapphire focus-visible:ring-offset-1"
        aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}
        title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
      >
        {isPinned
          ? <ChevronLeft size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />
          : <ChevronRight size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />
        }
      </button>

      <div className="overflow-y-auto flex-1 py-1 scrollbar-thin scrollbar-track-transparent">
        <nav className="px-2">
          {menuItems.map((item, index) =>
            item.type === "section" ? (
              !collapsed && (
                <div key={index} className="pt-3 pb-1">
                  <p className="px-2 text-[9.5px] font-semibold text-gray-400 dark:text-white/25 uppercase tracking-widest">
                    {item.label}
                  </p>
                </div>
              )
            ) : (
              <Link
                key={index}
                href={item.path}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`relative flex items-center ${collapsed ? "justify-center" : "justify-between"} px-3 py-1.5 text-xs font-medium rounded-lg my-0.5 transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-almet-sapphire/60 focus-visible:ring-inset ${
                  pathname.startsWith(item.path)
                    ? "bg-gradient-to-r from-almet-sapphire to-almet-astral text-white shadow-md shadow-almet-sapphire/25 scale-[1.02]"
                    : "text-gray-600 dark:text-white/55 hover:bg-almet-sapphire/8 dark:hover:bg-white/5 hover:text-almet-sapphire dark:hover:text-white/90"
                }`}
                title={collapsed ? item.label : ""}
              >
                {pathname.startsWith(item.path) && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full bg-white/60" />
                )}
                <div className="flex items-center gap-2">
                  <span className={`transition-all duration-200 ${
                    pathname.startsWith(item.path)
                      ? "text-white"
                      : "text-gray-400 dark:text-white/35 group-hover:text-almet-sapphire dark:group-hover:text-white/70"
                  } ${hoveredItem === item.id ? "scale-110" : ""}`}>
                    {item.icon}
                  </span>
                  {!collapsed && <span>{item.label}</span>}
                </div>
                {!collapsed && (
                  <ChevronRight className={`w-3 h-3 transition-all duration-200 ${
                    pathname.startsWith(item.path)
                      ? "opacity-60 translate-x-0"
                      : "opacity-0 -translate-x-1 group-hover:opacity-35 group-hover:translate-x-0"
                  }`} />
                )}
              </Link>
            )
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
