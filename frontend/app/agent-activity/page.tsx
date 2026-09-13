"use client";

import { useState } from "react";
import { Activity, Sparkles, RefreshCw, Bot, CheckCircle2, Play } from "lucide-react";
import { useOpportunityStore } from "@/lib/store";

export default function AgentActivityPage() {
  const { activities, triggerDiscovery } = useOpportunityStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRunScan = () => {
    setIsRefreshing(true);
    triggerDiscovery("Autonomous live scan");
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-aqua-400" />
            AI Agent Activity Stream
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time audit trail of all autonomous Strands & AgentCore execution steps.
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-xl bg-aqua-400 hover:bg-aqua-300 text-slate-950 text-xs font-bold shadow-glow-aqua flex items-center gap-2 transition disabled:opacity-75"
        >
          <Play className={`w-3.5 h-3.5 fill-slate-950 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Trigger Live Agent Cycle</span>
        </button>
      </div>

      {/* Live Timeline View */}
      <div className="glass-panel p-8 rounded-3xl space-y-6 relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
            Autonomous Execution Log ({activities.length} Events)
          </span>
          <span className="text-xs text-aqua-400 font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-aqua-400 animate-ping"></span>
            AgentCore Stream Active
          </span>
        </div>

        <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {activities.map((act, index) => (
            <div key={act.activity_id || index} className="relative flex items-start gap-4 group">
              {/* Point Node */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-950 border-2 border-aqua-400 flex items-center justify-center text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-aqua-400"></span>
              </div>

              {/* Card */}
              <div className="flex-1 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 group-hover:border-aqua-400/40 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <span className="text-base">{act.icon || "🤖"}</span>
                    <span className="text-aqua-300">{act.agent_name}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{act.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed font-sans">{act.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
