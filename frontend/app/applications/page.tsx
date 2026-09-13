"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";
import { DEMO_APPLICATIONS } from "@/lib/demo-data";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const data: any = await api.getApplications();
        if (data && data.length > 0) {
          setApplications(data);
        } else {
          setApplications(DEMO_APPLICATIONS);
        }
      } catch (e) {
        console.warn("Using fallback applications list:", e);
        setApplications(DEMO_APPLICATIONS);
      }
    }
    load();
  }, []);

  const displayApps = applications.length > 0 ? applications : DEMO_APPLICATIONS;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" />
            My Active Applications
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor readiness scores, generated answers, document status, and human approvals.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {displayApps.map((app) => (
          <div key={app.application_id} className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel-hover">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                  app.status === "SUBMITTED"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                  {app.status}
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {app.application_id}</span>
              </div>
              <h3 className="text-lg font-bold text-white">{app.opportunity_title}</h3>
              <p className="text-xs text-slate-400">{app.organization}</p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Readiness</div>
                <div className="text-lg font-bold text-emerald-400 font-mono">{app.readiness_score || 85}%</div>
              </div>

              <Link
                href={`/applications/${app.application_id}`}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-glow transition flex items-center gap-2"
              >
                <span>Open Workspace</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
