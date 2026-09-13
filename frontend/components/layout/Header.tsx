"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Bell, Sparkles, RefreshCw, LogOut, User, Settings } from "lucide-react";
import { useOpportunityStore } from "@/lib/store";

interface HeaderProps {
  onDiscoveryComplete?: () => void;
}

export default function Header({ onDiscoveryComplete }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, triggerDiscovery, logout } = useOpportunityStore();
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const handleRunDiscovery = async () => {
    setIsDiscovering(true);
    triggerDiscovery(searchQuery || undefined);
    if (onDiscoveryComplete) onDiscoveryComplete();
    setTimeout(() => {
      setIsDiscovering(false);
    }, 1200);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/opportunities?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
    logout();
    router.push("/login");
  };

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "SV";

  return (
    <header className="h-20 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Greeting Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          Good evening, {profile.name.split(" ")[0]} <span className="animate-bounce inline-block">👋</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          Your opportunity pipeline is active and updated by autonomous AI agents.
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative w-64 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search opportunities, skills..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-aqua-400 focus:ring-1 focus:ring-aqua-400 transition"
          />
        </div>

        {/* Run Discovery Trigger Button */}
        <button
          onClick={handleRunDiscovery}
          disabled={isDiscovering}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-aqua-400 hover:bg-aqua-300 text-slate-950 text-xs font-bold shadow-glow-aqua transition duration-150 disabled:opacity-75"
        >
          {isDiscovering ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              <span>Agents Discovering...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>Run Discovery</span>
            </>
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationPopup(!showNotificationPopup);
              setShowUserDropdown(false);
            }}
            className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 text-slate-300 relative transition"
          >
            <Bell className="w-4 h-4 text-slate-300 hover:text-aqua-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-aqua-400 ring-2 ring-slate-900"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotificationPopup && (
            <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                <span className="text-[10px] bg-aqua-400/20 text-aqua-300 px-2 py-0.5 rounded-full font-mono">3 New</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex gap-2.5">
                  <span className="text-rose-400 font-bold">🔴</span>
                  <div>
                    <p className="text-slate-200 font-semibold">Hackathon deadline tomorrow</p>
                    <p className="text-[11px] text-slate-400">National AI Hackathon closes in 24 hours.</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-2.5">
                  <span className="text-amber-400 font-bold">🟠</span>
                  <div>
                    <p className="text-slate-200 font-semibold">Recommendation Letter required</p>
                    <p className="text-[11px] text-slate-400">AWS Cloud Internship requires 1 missing doc.</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-aqua-500/10 border border-aqua-400/30 flex gap-2.5">
                  <span className="text-aqua-400 font-bold">🟢</span>
                  <div>
                    <p className="text-slate-200 font-semibold">Application ready for review</p>
                    <p className="text-[11px] text-slate-400">Form fields auto-filled. Awaiting human approval.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Account Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserDropdown(!showUserDropdown);
              setShowNotificationPopup(false);
            }}
            className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-aqua-400 text-slate-950 font-bold text-xs flex items-center justify-center font-mono">
              {initials}
            </div>
            <div className="hidden lg:block text-xs">
              <div className="font-bold text-slate-200">{profile.name}</div>
              <div className="text-[10px] text-slate-400">{profile.academic.department || "Computer Science"}</div>
            </div>
          </button>

          {/* User Profile Dropdown Menu */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 space-y-1 z-50 text-xs">
              <div className="px-3 py-2.5 border-b border-slate-800">
                <p className="font-bold text-white">{profile.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{profile.email}</p>
              </div>

              <Link
                href="/profile"
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <User className="w-4 h-4 text-aqua-400" />
                <span>Student Profile</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setShowUserDropdown(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Account Settings</span>
              </Link>

              <div className="border-t border-slate-800/80 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
