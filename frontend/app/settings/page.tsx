"use client";

import { useState } from "react";
import { Settings, Shield, Cpu, Key, CheckCircle2, Sliders, Bell } from "lucide-react";
import { useOpportunityStore } from "@/lib/store";

export default function SettingsPage() {
  const { settings, updateSettings } = useOpportunityStore();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-aqua-400" />
            System & Agent Settings
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure OpportunityOS AI agents, human approval guards, and match confidence thresholds.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-aqua-400 hover:bg-aqua-300 text-slate-950 text-xs font-extrabold shadow-glow-aqua flex items-center gap-2 transition"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Saved!</span>
            </>
          ) : (
            <span>Save Configuration</span>
          )}
        </button>
      </div>

      <div className="space-y-6">
        {/* Human Guard & Safety Settings */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-aqua-400" />
            Human Approval Guard & Security Policy
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <h4 className="font-bold text-white">Require Student Approval Before Final Form Submission</h4>
                <p className="text-[11px] text-slate-400">Agent auto-fills all fields and pauses for student review.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireHumanApproval}
                  onChange={(e) => updateSettings({ requireHumanApproval: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-aqua-400"></div>
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>AI Auto-Fill Confidence Threshold</span>
                <span className="font-mono text-aqua-400 font-bold">{(settings.confidenceThreshold * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="0.99"
                step="0.05"
                value={settings.confidenceThreshold}
                onChange={(e) => updateSettings({ confidenceThreshold: parseFloat(e.target.value) })}
                className="w-full accent-aqua-400 bg-slate-950 rounded-lg cursor-pointer"
              />
              <p className="text-[11px] text-slate-400">
                Form fields matching below this confidence will be flagged for explicit manual confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* Discovery Scan Schedule */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="w-4 h-4 text-lightgreen-400" />
            Agent Scanner Frequency & Model Specs
          </h3>

          <div className="grid md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 text-[11px] font-semibold block">Opportunity Scanner Frequency</label>
              <select
                value={settings.discoveryFrequency}
                onChange={(e) => updateSettings({ discoveryFrequency: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none mt-1"
              >
                <option value="Real-time Continuous">Real-time Continuous</option>
                <option value="Every 6 Hours">Every 6 Hours</option>
                <option value="Daily Batch">Daily Batch</option>
                <option value="Manual Trigger Only">Manual Trigger Only</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] font-semibold block">Active Reasoning Engine</label>
              <input
                type="text"
                readOnly
                value="FastAPI Bedrock AgentCore Runtime"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-aqua-300 font-mono mt-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
