"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkles, Search, CheckCircle2, Clock, MapPin, Building2, Plus, X } from "lucide-react";
import { useOpportunityStore } from "@/lib/store";

const categories = ["ALL", "INTERNSHIP", "SCHOLARSHIP", "HACKATHON", "FELLOWSHIP", "COMPETITION", "CERTIFICATION"];

function OpportunitiesContent() {
  const searchParams = useSearchParams();
  const { opportunities, addOpportunity, saveOpportunityToPipeline, applications } = useOpportunityStore();
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("search") || "");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(searchParams?.get("add") === "true");

  // Custom Form state
  const [newOpp, setNewOpp] = useState({
    title: "",
    organization: "",
    type: "INTERNSHIP",
    stipend_or_reward: "",
    location: "Remote",
    deadline: "",
    application_url: "",
    description: "",
    eligibility_criteria: "",
  });

  useEffect(() => {
    if (searchParams?.get("search")) {
      setSearchQuery(searchParams.get("search") || "");
    }
  }, [searchParams]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpp.title || !newOpp.organization) return;

    addOpportunity({
      title: newOpp.title,
      organization: newOpp.organization,
      type: newOpp.type,
      stipend_or_reward: newOpp.stipend_or_reward || "Competitive",
      location: newOpp.location || "Remote",
      deadline: newOpp.deadline || "2026-11-30",
      application_url: newOpp.application_url || "https://careers.google.com",
      description: newOpp.description || "Real user added opportunity.",
      eligibility_criteria: newOpp.eligibility_criteria ? newOpp.eligibility_criteria.split(",") : ["Undergraduate / Graduate"],
    });

    setShowAddModal(false);
    setNewOpp({
      title: "",
      organization: "",
      type: "INTERNSHIP",
      stipend_or_reward: "",
      location: "Remote",
      deadline: "",
      application_url: "",
      description: "",
      eligibility_criteria: "",
    });
  };

  const filteredOpps = opportunities.filter((o) => {
    if (selectedCategory !== "ALL" && o.type !== selectedCategory) return false;
    if (remoteOnly && !o.is_remote) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.title.toLowerCase().includes(q) ||
        o.organization.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-aqua-400" />
            Discovered Opportunities
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time opportunity feed managed and scored by your autonomous AI agents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by role, company, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-aqua-400 transition"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-aqua-400 hover:bg-aqua-300 text-slate-950 text-xs font-bold transition shadow-glow-aqua flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Opportunity</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition ${
                selectedCategory === cat
                  ? "bg-aqua-400 text-slate-950 shadow-glow-sm"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-300 font-medium cursor-pointer bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(e) => setRemoteOnly(e.target.checked)}
            className="rounded border-slate-700 bg-slate-950 text-aqua-400 focus:ring-0"
          />
          <span>Remote Only</span>
        </label>
      </div>

      {/* Grid List of Opportunities */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredOpps.map((opp) => {
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
                  <h3 className="font-bold text-white text-base leading-snug">{opp.title}</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    {opp.organization}
                  </p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {opp.description}
                </p>

                <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> Deadline:
                    </span>
                    <span className="font-mono text-slate-200">{opp.deadline}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> Location:
                    </span>
                    <span className="text-slate-200">{opp.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Stipend / Value:</span>
                    <span className="font-semibold text-lightgreen-300">{opp.stipend_or_reward}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
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
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
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

      {/* Add Custom Opportunity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xl space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-aqua-400" />
                Add Real Opportunity
              </h2>
              <p className="text-xs text-slate-400">
                Enter details for a real opportunity to track, qualify, and auto-fill in your pipeline.
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Opportunity Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer Intern 2026"
                    value={newOpp.title}
                    onChange={(e) => setNewOpp({ ...newOpp, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Organization / Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Google / Microsoft / Startup"
                    value={newOpp.organization}
                    onChange={(e) => setNewOpp({ ...newOpp, organization: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Category Type</label>
                  <select
                    value={newOpp.type}
                    onChange={(e) => setNewOpp({ ...newOpp, type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none"
                  >
                    {categories.filter((c) => c !== "ALL").map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Stipend / Prize</label>
                  <input
                    type="text"
                    placeholder="e.g. $5,000 / month"
                    value={newOpp.stipend_or_reward}
                    onChange={(e) => setNewOpp({ ...newOpp, stipend_or_reward: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Deadline</label>
                  <input
                    type="date"
                    value={newOpp.deadline}
                    onChange={(e) => setNewOpp({ ...newOpp, deadline: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote / Bengaluru / New York"
                    value={newOpp.location}
                    onChange={(e) => setNewOpp({ ...newOpp, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Application URL</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newOpp.application_url}
                    onChange={(e) => setNewOpp({ ...newOpp, application_url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Description</label>
                <textarea
                  rows={2}
                  placeholder="Overview of the opportunity, project responsibilities, or challenge goals..."
                  value={newOpp.description}
                  onChange={(e) => setNewOpp({ ...newOpp, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-aqua-400 hover:bg-aqua-300 text-slate-950 font-extrabold shadow-glow-aqua"
                >
                  Add Opportunity to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 font-mono">Loading Opportunities...</div>}>
      <OpportunitiesContent />
    </Suspense>
  );
}
