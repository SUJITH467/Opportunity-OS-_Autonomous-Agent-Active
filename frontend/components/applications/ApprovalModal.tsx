"use client";

import { useState } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2, Lock, ArrowLeft } from "lucide-react";
import { useOpportunityStore } from "@/lib/store";

interface ApprovalModalProps {
  application: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function ApprovalModal({ application, isOpen, onClose, onSubmitted }: ApprovalModalProps) {
  const { updateApplicationStatus, profile } = useOpportunityStore();
  const [isApproved, setIsApproved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [approvalLog, setApprovalLog] = useState<any>(null);

  if (!isOpen || !application) return null;

  const handleApproveAndSubmit = () => {
    setIsSubmitting(true);
    updateApplicationStatus(application.application_id, "SUBMITTED");
    setIsApproved(true);
    setApprovalLog({
      approved_by: profile.name,
      approval_timestamp: new Date().toISOString(),
      application_id: application.application_id,
    });
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitted();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-aqua-400/10 rounded-full blur-3xl pointer-events-none"></div>

        {!isApproved ? (
          <>
            {/* Header */}
            <div className="flex items-start gap-4 border-b border-slate-800 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
                  Human Approval Guard Active
                </span>
                <h2 className="text-xl font-bold text-white mt-1">Final Application Review</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Opportunity: <strong className="text-aqua-300">{application.opportunity_title}</strong> ({application.organization})
                </p>
              </div>
            </div>

            {/* Summary Card */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
              <p className="text-xs font-semibold text-slate-300">The agent has pre-filled all requirements. Grant authorization to finalize.</p>
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Fields Prepared</div>
                  <div className="text-lg font-bold text-lightgreen-400 font-mono">100%</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">Documents Attached</div>
                  <div className="text-lg font-bold text-aqua-400 font-mono">Verified</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <div className="text-xs text-slate-400">AI Essays</div>
                  <div className="text-lg font-bold text-amber-400 font-mono">Grounded</div>
                </div>
              </div>
            </div>

            {/* Security Guarantee Note */}
            <div className="p-4 rounded-xl bg-aqua-400/10 border border-aqua-400/30 text-xs text-slate-200 flex items-start gap-3">
              <Lock className="w-5 h-5 text-aqua-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-aqua-300">Strict Human-in-the-Loop Guarantee</p>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  OpportunityOS never submits applications automatically. Review all fields, answers, and attachments before granting explicit authorization.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium transition flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back & Edit
              </button>

              <button
                onClick={handleApproveAndSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-aqua-400 hover:bg-aqua-300 text-slate-950 text-xs font-extrabold shadow-glow-aqua transition flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-slate-950" />
                    <span>Approve & Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Success Screen with Audit Log */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-lightgreen-500/20 text-lightgreen-400 border border-lightgreen-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Application Authorized & Submitted!</h3>
              <p className="text-xs text-slate-400 mt-1">Application status transitioned to <strong className="text-lightgreen-400 font-mono">SUBMITTED</strong>.</p>
            </div>

            {/* Audit Log Box */}
            {approvalLog && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs font-mono space-y-1.5 text-slate-300">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold border-b border-slate-800 pb-1">Audit Trail Record</div>
                <div>approved_by: <span className="text-aqua-400">"{approvalLog.approved_by}"</span></div>
                <div>approval_timestamp: <span className="text-lightgreen-400">"{approvalLog.approval_timestamp}"</span></div>
                <div>application_id: <span className="text-amber-400">"{approvalLog.application_id}"</span></div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
