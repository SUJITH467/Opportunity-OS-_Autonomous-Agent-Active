"use client";

import { useState } from "react";
import { User, Save, BookOpen, Cpu, Target, Sliders, CheckCircle2 } from "lucide-react";
import { useOpportunityStore } from "@/lib/store";

export default function ProfilePage() {
  const { profile, updateProfile } = useOpportunityStore();
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    college: profile.academic.college,
    degree: profile.academic.degree,
    department: profile.academic.department,
    cgpa: profile.academic.cgpa,
    skills: profile.skills.join(", "),
    career_goals: profile.career_goals.join(", "),
    locations: profile.preferences.preferred_locations.join(", "),
    min_match_score: profile.preferences.min_match_score,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: formData.name,
      email: formData.email,
      academic: {
        ...profile.academic,
        college: formData.college,
        degree: formData.degree,
        department: formData.department,
        cgpa: parseFloat(formData.cgpa.toString()) || 8.8,
      },
      skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
      career_goals: formData.career_goals.split(",").map((g) => g.trim()).filter(Boolean),
      preferences: {
        ...profile.preferences,
        preferred_locations: formData.locations.split(",").map((l) => l.trim()).filter(Boolean),
        min_match_score: parseInt(formData.min_match_score.toString()) || 70,
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-aqua-400" />
            Student Master Profile
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            This profile is used by OpportunityOS agents to evaluate eligibility, generate custom essays, and auto-fill applications.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="px-5 py-2.5 rounded-xl bg-aqua-400 hover:bg-aqua-300 text-slate-950 text-xs font-extrabold shadow-glow-aqua flex items-center gap-2 transition"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>Saved to Memory!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4 text-slate-950" />
              <span>Save Profile</span>
            </>
          )}
        </button>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        {/* Academic Education */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <BookOpen className="w-4 h-4 text-aqua-400" />
            Personal & Academic Information
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 text-[11px] font-semibold block">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none mt-1"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px] font-semibold block">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none mt-1"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px] font-semibold block">College / University</label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none mt-1"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-slate-400 text-[11px] font-semibold block">Degree</label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[11px] font-semibold block">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none mt-1"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[11px] font-semibold block">CGPA</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:border-aqua-400 focus:outline-none mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Cpu className="w-4 h-4 text-lightgreen-400" />
            Skills & Competencies
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 text-[11px] font-semibold block mb-1">Key Technical Skills (comma separated)</label>
              <textarea
                rows={4}
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none font-mono"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {formData.skills.split(",").map((s, idx) => (
                <span key={idx} className="bg-aqua-400/20 text-aqua-300 border border-aqua-400/30 px-2.5 py-1 rounded-lg font-mono text-[11px]">
                  {s.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Career Goals */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Target className="w-4 h-4 text-amber-400" />
            Career Goals & Target Roles
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 text-[11px] font-semibold block mb-1">Target Roles (comma separated)</label>
              <input
                type="text"
                value={formData.career_goals}
                onChange={(e) => setFormData({ ...formData, career_goals: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-rose-400" />
            Opportunity Match Preferences
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 text-[11px] font-semibold block mb-1">Preferred Locations (comma separated)</label>
              <input
                type="text"
                value={formData.locations}
                onChange={(e) => setFormData({ ...formData, locations: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px] font-semibold block mb-1">Minimum Match Threshold (%)</label>
              <input
                type="number"
                min="50"
                max="100"
                value={formData.min_match_score}
                onChange={(e) => setFormData({ ...formData, min_match_score: parseInt(e.target.value) || 70 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-aqua-400 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
