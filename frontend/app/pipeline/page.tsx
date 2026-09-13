"use client";

import Link from "next/link";
import { Sparkles, AlertTriangle, ChevronRight } from "lucide-react";
import { useOpportunityStore } from "@/lib/store";

const PIPELINE_STAGES = [
  { id: "SAVED", title: "SAVED", color: "border-slate-800 text-slate-400" },
  { id: "PREPARING", title: "PREPARING", color: "border-aqua-400/30 text-aqua-300" },
  { id: "AWAITING_APPROVAL", title: "AWAITING APPROVAL", color: "border-amber-500/40 text-amber-300 bg-amber-500/5" },
  { id: "SUBMITTED", title: "SUBMITTED", color: "border-lightgreen-500/50 text-lightgreen-400" },
  { id: "ACCEPTED", title: "ACCEPTED", color: "border-aqua-400 text-aqua-300" },
];

export default function PipelinePage() {
  const { applications, opportunities } = useOpportunityStore();

  return (
    <div className="space-y-6 max-w-full overflow-x-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-aqua-400" />
            Application KanBan Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track and manage your opportunity workflow from AI discovery to human approval and submission.
          </p>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="flex gap-4 min-w-max pb-6">
        {PIPELINE_STAGES.map((stage) => {
          let items = applications.filter((app) => app.status === stage.id);

          return (
            <div key={stage.id} className="w-72 shrink-0 space-y-3">
              {/* Column Header */}
              <div className={`p-3 rounded-xl bg-slate-900 border ${stage.color} flex items-center justify-between text-xs font-bold font-mono`}>
                <span>{stage.title}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-300">{items.length}</span>
              </div>

              {/* Column Items */}
              <div className="space-y-3 min-h-[500px]">
                {items.length === 0 ? (
                  <div className="h-32 border border-dashed border-slate-800/80 rounded-2xl flex items-center justify-center text-[11px] text-slate-600 italic">
                    No applications in stage
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.application_id}
                      className="glass-panel p-4 rounded-2xl space-y-3 border border-slate-800 hover:border-aqua-400/40 transition shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold font-mono text-lightgreen-400 bg-lightgreen-500/10 px-2 py-0.5 rounded">
                          {item.overall_score || 94}% Match
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.deadline || "Sep 25"}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">{item.opportunity_title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.organization}</p>
                      </div>

                      {/* Readiness Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                          <span>Readiness</span>
                          <span className="text-aqua-300 font-bold">{item.readiness_score || 80}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-aqua-400 to-lightgreen-400 rounded-full"
                            style={{ width: `${item.readiness_score || 80}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Missing docs alert */}
                      {item.missing_documents && item.missing_documents.length > 0 && (
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span className="truncate">Missing: {item.missing_documents[0]}</span>
                        </div>
                      )}

                      {/* Action Link */}
                      <Link
                        href={`/applications/${item.application_id}`}
                        className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition flex items-center justify-center gap-1 border border-slate-700/50"
                      >
                        <span>Open Workspace</span>
                        <ChevronRight className="w-3.5 h-3.5 text-aqua-400" />
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
