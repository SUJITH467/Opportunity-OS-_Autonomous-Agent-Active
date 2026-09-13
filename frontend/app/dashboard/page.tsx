"use client";

import Link from "next/link";
import { Sparkles, Calendar, Clock, CheckCircle2, Zap, ArrowUpRight, Plus, Rocket } from "lucide-react";
import { useOpportunityStore } from "@/lib/store";

export default function DashboardPage() {
  const { opportunities, applications, saveOpportunityToPipeline, triggerDiscovery } = useOpportunityStore();

  const savedApps = applications.filter((a) => a.status === "SAVED" || a.status === "AWAITING_APPROVAL");
  const awaitingApproval = applications.filter((a) => a.status === "AWAITING_APPROVAL");

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Dashboard Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Discovered Opportunities</div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white font-mono">{opportunities.length}</span>
            <span className="text-[11px] bg-aqua-400/20 text-aqua-300 font-mono px-2 py-0.5 rounded-full border border-aqua-400/30">
              Live Verified
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Active Pipeline</div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-aqua-400 font-mono">{applications.length}</span>
            <span className="text-[11px] bg-aqua-400/20 text-aqua-300 font-mono px-2 py-0.5 rounded-full border border-aqua-400/30">
              In Progress
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Awaiting Approval</div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">{awaitingApproval.length}</span>
            <span className="text-[11px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
              Human Guard
            </span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Auto-Filled Readiness</div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-lightgreen-400 font-mono">94%</span>
            <span className="text-[11px] bg-lightgreen-500/20 text-lightgreen-300 font-mono px-2 py-0.5 rounded-full border border-lightgreen-500/30">
              Optimal Match
            </span>
          </div>
        </div>
      </div>

      {/* Action Quick Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-aqua-400/30 shadow-glow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-aqua-400 text-slate-950 flex items-center justify-center font-bold">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Autonomous Agent Hub</h3>
            <p className="text-xs text-slate-400">Trigger live opportunity scanner or input your own opportunity.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => triggerDiscovery()}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-aqua-400" />
            <span>Scan New Opportunities</span>
          </button>
          <Link
            href="/opportunities?add=true"
            className="px-4 py-2 rounded-xl bg-aqua-400 hover:bg-aqua-300 text-slate-950 text-xs font-extrabold transition shadow-glow-aqua flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Opportunity</span>
          </Link>
        </div>
      </div>

      {/* Top Priority Opportunities Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-aqua-400" />
              High Match Recommendations
            </h2>
            <p className="text-xs text-slate-400">Scored and prioritized based on your student profile and career goals.</p>
          </div>
          <Link href="/opportunities" className="text-xs text-aqua-400 hover:text-aqua-300 font-semibold flex items-center gap-1">
            View All ({opportunities.length}) Opportunities →
          </Link>
        </div>

        {/* Opportunity Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {opportunities.slice(0, 6).map((opp) => {
            const isSaved = applications.some((a) => a.opportunity_id === opp.opportunity_id);

            return (
              <div key={opp.opportunity_id} className="glass-panel p-6 rounded-3xl space-y-4 glass-panel-hover flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-md uppercase bg-aqua-400/15 text-aqua-300 border border-aqua-400/30">
                      [{opp.type}]
                    </span>
                    <span className="text-xs font-bold font-mono text-lightgreen-400 bg-lightgreen-500/10 px-2.5 py-1 rounded-full border border-lightgreen-500/20">
                      {opp.overall_score}% Match
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base leading-snug line-clamp-1">{opp.title}</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{opp.organization}</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" /> Deadline:
                      </span>
                      <span className="font-mono text-slate-200">{opp.deadline}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Stipend / Reward:</span>
                      <span className="font-semibold text-lightgreen-300">{opp.stipend_or_reward}</span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {opp.eligibility_criteria.slice(0, 3).map((c: string, idx: number) => (
                      <span key={idx} className="text-[10px] bg-slate-850 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                        {c.split(":")[0]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-aqua-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-aqua-400" />
                    <span>Eligible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/opportunities/${opp.opportunity_id}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium transition"
                    >
                      Details
                    </Link>
                    <button
                      onClick={() => saveOpportunityToPipeline(opp.opportunity_id)}
                      disabled={isSaved}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-glow-sm ${
                        isSaved
                          ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-default"
                          : "bg-aqua-400 hover:bg-aqua-300 text-slate-950 shadow-glow-aqua"
                      }`}
                    >
                      {isSaved ? "In Pipeline" : "Apply"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Pipeline KanBan Summary */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            Active Application Pipeline State
          </h3>
          <Link href="/pipeline" className="text-xs text-aqua-400 hover:underline font-semibold">
            Open Pipeline Kanban →
          </Link>
        </div>

        <div className="space-y-3">
          {applications.map((app) => (
            <div key={app.application_id} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-aqua-400/20 border border-aqua-400/30 flex items-center justify-center text-aqua-300 font-bold text-xs font-mono">
                  {app.organization.slice(0, 3).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{app.opportunity_title}</h4>
                  <p className="text-xs text-slate-400">
                    {app.organization} • Status: <strong className="text-aqua-400 font-mono">{app.status}</strong>
                  </p>
                </div>
              </div>
              <Link
                href={`/applications/${app.application_id}`}
                className="px-4 py-2 rounded-xl bg-slate-800 border border-aqua-400/40 text-aqua-300 hover:bg-slate-700 text-xs font-bold transition flex items-center gap-2"
              >
                <span>Review Application</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
