"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Sparkles, CheckCircle2, AlertTriangle, ArrowLeft, ShieldCheck, Bot } from "lucide-react";
import { useOpportunityStore } from "@/lib/store";
import AnswerEditor from "@/components/applications/AnswerEditor";
import ApprovalModal from "@/components/applications/ApprovalModal";

export default function ApplicationWorkspacePage() {
  const params = useParams();
  const { applications } = useOpportunityStore();
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const appId = params?.id as string;
  const app = applications.find((a) => a.application_id === appId) || applications[0];

  if (!app) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        <Bot className="w-6 h-6 animate-spin mx-auto text-aqua-400 mb-2" />
        Loading Application Workspace...
      </div>
    );
  }

  const isSubmitted = app.status === "SUBMITTED";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/pipeline" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Pipeline
        </Link>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Application Status:</span>
          <span className={`px-3 py-1 rounded-full font-bold ${
            isSubmitted
              ? "bg-lightgreen-500/20 text-lightgreen-300 border border-lightgreen-500/30"
              : "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse"
          }`}>
            {app.status}
          </span>
        </div>
      </div>

      {/* Main Title Banner & Progress Bar */}
      <div className="glass-panel p-8 rounded-3xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono uppercase text-aqua-400 font-bold tracking-wider">
              {app.organization}
            </span>
            <h1 className="text-3xl font-extrabold text-white mt-0.5">{app.opportunity_title}</h1>
          </div>

          {!isSubmitted && (
            <button
              onClick={() => setShowApprovalModal(true)}
              className="px-6 py-3 rounded-2xl bg-aqua-400 hover:bg-aqua-300 text-slate-950 text-xs font-extrabold shadow-glow-aqua transition flex items-center gap-2 shrink-0"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>Review & Approve Application</span>
            </button>
          )}
        </div>

        {/* 80% Application Progress Checklist Bar */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Application Readiness</span>
            <span className="text-lightgreen-400 font-bold">{app.readiness_score || 85}% Complete</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-aqua-400 via-lightgreen-400 to-lightgreen-300 rounded-full transition-all duration-500"
              style={{ width: `${app.readiness_score || 85}%` }}
            ></div>
          </div>

          {/* Checklist items */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs font-medium pt-2">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Profile Info</span>
              <CheckCircle2 className="w-4 h-4 text-lightgreen-400" />
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Resume</span>
              <CheckCircle2 className="w-4 h-4 text-lightgreen-400" />
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Academic</span>
              <CheckCircle2 className="w-4 h-4 text-lightgreen-400" />
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Questions</span>
              <CheckCircle2 className="w-4 h-4 text-lightgreen-400" />
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Documents</span>
              <CheckCircle2 className="w-4 h-4 text-lightgreen-400" />
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-300 font-bold">
              <span>Final Review</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Generated Response Answers Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-aqua-400" />
            AI Prepared Application Answers
          </h3>
          <span className="text-xs text-slate-400">All answers are editable by student before approval</span>
        </div>

        <div className="space-y-4">
          {app.generated_answers?.map((ans: any) => (
            <AnswerEditor
              key={ans.question_id}
              applicationId={app.application_id}
              question={ans}
            />
          ))}
        </div>
      </div>

      {/* Form Fields Auto-Filled Preview */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
          AgentCore Browser Form Mapping ({app.form_fields?.length || 5} Fields)
        </h3>

        <div className="grid md:grid-cols-2 gap-3 text-xs">
          {app.form_fields?.map((f: any) => (
            <div key={f.field_id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">{f.label}:</span>
              <span className="font-semibold text-aqua-300 font-mono">{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal trigger */}
      <ApprovalModal
        application={app}
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        onSubmitted={() => {
          setShowApprovalModal(false);
        }}
      />
    </div>
  );
}
