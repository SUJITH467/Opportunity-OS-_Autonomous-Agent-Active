"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Sparkles, 
  Kanban, 
  FileText, 
  FolderGit2, 
  Activity, 
  User, 
  Settings, 
  Bot, 
  ShieldAlert
} from "lucide-react";
import { useOpportunityStore } from "@/lib/store";

export default function Sidebar() {
  const pathname = usePathname();
  const { opportunities, applications, documents } = useOpportunityStore();

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Opportunities", href: "/opportunities", icon: Sparkles, badge: opportunities.length.toString() },
    { name: "My Pipeline", href: "/pipeline", icon: Kanban },
    { name: "Applications", href: "/applications", icon: FileText, badge: applications.length.toString() },
    { name: "Documents", href: "/documents", icon: FolderGit2, badge: documents.length.toString() },
    { name: "Agent Activity", href: "/agent-activity", icon: Activity, live: true },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-aqua-500 via-aqua-400 to-lightgreen-400 p-0.5 shadow-glow">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-aqua-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">
                Opportunity<span className="text-aqua-400">OS</span>
              </span>
            </div>
            <p className="text-[10px] text-aqua-400 font-mono tracking-wide uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-aqua-400 animate-pulse"></span>
              Autonomous Agent Active
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-aqua-400/15 text-aqua-300 border border-aqua-400/40 font-semibold shadow-glow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-aqua-400" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                    isActive ? "bg-aqua-400 text-slate-950" : "bg-slate-800 text-slate-400"
                  }`}>
                    {item.badge}
                  </span>
                )}
                {item.live && (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aqua-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-aqua-400"></span>
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Human-In-The-Loop Security Badge */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-950/80 border border-aqua-400/30 text-xs space-y-2">
          <div className="flex items-center gap-2 text-aqua-300 font-semibold">
            <ShieldAlert className="w-4 h-4 text-aqua-400" />
            Human Approval Guard
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Form auto-fill pauses before final submission. Zero automatic submissions without student confirmation.
          </p>
        </div>
      </div>
    </aside>
  );
}
