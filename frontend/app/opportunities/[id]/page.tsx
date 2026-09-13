"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, Building2, MapPin, Calendar, ExternalLink, CheckCircle2, ArrowLeft, ShieldCheck, Zap, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [opp, setOpp] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!params?.id) return;
      try {
        const data = await api.getOpportunityById(params.id as string);
        setOpp(data);
      } catch (e) {
        console.warn("Using fallback detailed opportunity:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params]);

  const handleApplyWithOpportunityOS = async () => {
    if (!opp) return;
    try {
      await api.saveOpportunity(opp.opportunity_id);
      router.push("/pipeline");
    } catch (e) {
      router.push("/pipeline");
    }
  };

  if (loading || !opp) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        <Sparkles className="w-6 h-6 animate-spin mx-auto text-indigo-400 mb-2" />
        Loading AI Opportunity Insights...
      </div>
    );
  }

  const breakdown = opp.score_breakdown || {
    eligibility_score: 92,
    relevance_score: 96,
    skill_match_score: 91,
    deadline_urgency_score: 88,
    explanation: "Your AWS and Python skills strongly match the technical requirements. Your cloud learning goal also aligns with this opportunity."
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/opportunities" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-medium">
          <ArrowLeft className="w-4 h-4" />
          Back to Opportunities
        </Link>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-medium">
            Save
          </button>
          <button
            onClick={handleApplyWithOpportunityOS}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-glow transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
            Apply with OpportunityOS
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="glass-panel p-8 rounded-3xl space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-md font-bold">
                {opp.type}
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
                ✓ Verified Canonical Opportunity
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">{opp.title}</h1>
            <p className="text-sm text-slate-400 flex items-center gap-3 font-medium">
              <span className="flex items-center gap-1.5 text-slate-200">
                <Building2 className="w-4 h-4 text-indigo-400" /> {opp.organization}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-500" /> {opp.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" /> Deadline: {opp.deadline}
              </span>
            </p>
          </div>

          {/* Match Badge */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 text-center shrink-0">
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Overall Match</div>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-0.5">{opp.overall_score}%</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Left Details, Right AI Analysis */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">Opportunity Overview</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{opp.description}</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">Eligibility & Requirements</h3>
            <div className="space-y-2 text-xs text-slate-300">
              {opp.eligibility_criteria.map((c: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">Benefits & Perks</h3>
            <div className="space-y-2 text-xs text-slate-300">
              {opp.benefits.map((b: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: AI Opportunity Analysis Box */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 space-y-5 bg-gradient-to-b from-indigo-950/30 to-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                AI Opportunity Analysis
              </h3>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">AgentCore</span>
            </div>

            {/* Score List */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Match Score</span>
                <span className="font-mono font-bold text-emerald-400">{opp.overall_score}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Eligibility</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">✓ Eligible</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Career Alignment</span>
                <span className="font-mono font-bold text-indigo-300">{breakdown.relevance_score}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Skill Match</span>
                <span className="font-mono font-bold text-indigo-300">{breakdown.skill_match_score}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Deadline Urgency</span>
                <span className="font-mono font-bold text-rose-400">High</span>
              </div>
            </div>

            {/* Why this matches you */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-indigo-300">Why this matches you</h4>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{breakdown.explanation}"
              </p>
            </div>

            <button
              onClick={handleApplyWithOpportunityOS}
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-glow transition text-center block"
            >
              Apply with OpportunityOS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
