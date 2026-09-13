"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Sparkles, Check, ArrowRight, ArrowLeft, Cpu, Target, ShieldCheck, Edit3 } from "lucide-react";
import { useOpportunityStore } from "@/lib/store";

const STEPS = ["Academic Verification", "Technical Skills", "Career Goals", "Document Upload"];

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, updateProfile } = useOpportunityStore();
  const [currentStep, setCurrentStep] = useState(0);

  // Dynamic Academic State initialized from store profile
  const [academicState, setAcademicState] = useState({
    college: profile.academic?.college || "National Institute of Technology",
    degree: profile.academic?.degree || "B.Tech",
    department: profile.academic?.department || "Computer Science & Engineering",
    graduation_year: String(profile.academic?.graduation_year || 2027),
    cgpa: String(profile.academic?.cgpa || 8.8),
  });

  const [skills, setSkills] = useState<string[]>(
    profile.skills?.length ? profile.skills : ["Python", "AWS", "TypeScript", "React", "FastAPI"]
  );
  const [newSkill, setNewSkill] = useState("");
  const [goals, setGoals] = useState<string[]>(
    profile.career_goals?.length ? profile.career_goals : ["AWS Cloud Engineer", "AI Solutions Architect"]
  );
  const [newGoal, setNewGoal] = useState("");

  const handleNext = () => {
    if (currentStep === 0) {
      // Save any tuned academic fields
      updateProfile({
        academic: {
          ...profile.academic,
          college: academicState.college,
          degree: academicState.degree,
          department: academicState.department,
          graduation_year: parseInt(academicState.graduation_year) || 2027,
          cgpa: parseFloat(academicState.cgpa) || 8.8,
        },
      });
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finalize onboarding and save skills + goals
      updateProfile({
        skills,
        career_goals: goals,
      });
      router.push("/dashboard");
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updated = [...skills, newSkill.trim()];
      setSkills(updated);
      setNewSkill("");
    }
  };

  const removeSkill = (sToRemove: string) => {
    setSkills(skills.filter((s) => s !== sToRemove));
  };

  const addGoal = () => {
    if (newGoal.trim() && !goals.includes(newGoal.trim())) {
      const updated = [...goals, newGoal.trim()];
      setGoals(updated);
      setNewGoal("");
    }
  };

  const removeGoal = (gToRemove: string) => {
    setGoals(goals.filter((g) => g !== gToRemove));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans py-12">
      {/* Background Glow */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#42f5e3]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-2xl space-y-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#42f5e3] to-cyan-500 p-0.5 shadow-[0_0_15px_rgba(66,245,227,0.3)]">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#42f5e3]" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Student Onboarding Wizard</h1>
              <p className="text-xs text-slate-400">Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}</p>
            </div>
          </div>

          <span className="text-xs font-mono text-[#42f5e3] bg-[#42f5e3]/10 px-3 py-1 rounded-full border border-[#42f5e3]/20">
            {Math.round(((currentStep + 1) / STEPS.length) * 100)}% Setup
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#42f5e3] to-cyan-400 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          ></div>
        </div>

        {/* Card Content */}
        <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl space-y-6 border border-slate-800/80 shadow-2xl min-h-[400px] flex flex-col justify-between">
          {currentStep === 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#42f5e3]" /> Confirm Academic Records
                </h2>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Edit3 className="w-3.5 h-3.5 text-[#42f5e3]" /> Editable
                </span>
              </div>
              <p className="text-xs text-slate-400">
                OpportunityOS verifies your academic metrics to determine eligibility for restricted programs.
              </p>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3.5 text-xs text-slate-300">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-1">Degree</label>
                    <input
                      type="text"
                      value={academicState.degree}
                      onChange={(e) => setAcademicState({ ...academicState, degree: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#42f5e3]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-1">Department</label>
                    <input
                      type="text"
                      value={academicState.department}
                      onChange={(e) => setAcademicState({ ...academicState, department: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#42f5e3]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">College / University</label>
                  <input
                    type="text"
                    value={academicState.college}
                    onChange={(e) => setAcademicState({ ...academicState, college: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#42f5e3]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-1">Graduation Year</label>
                    <input
                      type="text"
                      value={academicState.graduation_year}
                      onChange={(e) => setAcademicState({ ...academicState, graduation_year: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-[#42f5e3] font-mono focus:outline-none focus:border-[#42f5e3]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 font-semibold block mb-1">Current CGPA</label>
                    <input
                      type="text"
                      value={academicState.cgpa}
                      onChange={(e) => setAcademicState({ ...academicState, cgpa: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-[#42f5e3] font-mono focus:outline-none focus:border-[#42f5e3]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#42f5e3]" /> Select & Add Technical Skills
              </h2>
              <p className="text-xs text-slate-400">
                Add programming languages, frameworks, and cloud skills to boost your Opportunity Match score.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. PyTorch, Go, Kubernetes)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#42f5e3]"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 rounded-xl bg-[#42f5e3] text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(66,245,227,0.3)] hover:bg-[#34e2cf]"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-xl bg-[#42f5e3]/10 border border-[#42f5e3]/30 text-[#42f5e3] text-xs font-mono flex items-center gap-1.5 cursor-pointer hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 transition"
                    onClick={() => removeSkill(s)}
                    title="Click to remove"
                  >
                    <Check className="w-3 h-3 text-[#42f5e3]" /> {s} ×
                  </span>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" /> Define Target Career Roles
              </h2>
              <p className="text-xs text-slate-400">
                Target goals help the AI ranking agent calculate career alignment relevance (25% weight).
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Target role (e.g. Cloud Solutions Architect)..."
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#42f5e3]"
                />
                <button
                  type="button"
                  onClick={addGoal}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold"
                >
                  Add Goal
                </button>
              </div>

              <div className="space-y-2 pt-2 text-xs">
                {goals.map((g) => (
                  <div
                    key={g}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 font-medium flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <span>🎯</span> {g}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGoal(g)}
                      className="text-slate-500 hover:text-rose-400 text-xs px-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-[#42f5e3]/20 text-[#42f5e3] border border-[#42f5e3]/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(66,245,227,0.3)]">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white">Your OpportunityOS Profile is Ready!</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Autonomous agents are active and ready to discover scholarships, internships, hackathons, and fellowships matching your verified profile.
              </p>
            </div>
          )}

          {/* Navigation Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-800">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-xs font-medium disabled:opacity-40 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#42f5e3] to-cyan-400 text-slate-950 text-xs font-bold shadow-[0_0_20px_rgba(66,245,227,0.3)] hover:shadow-[0_0_25px_rgba(66,245,227,0.5)] flex items-center gap-2 transition"
            >
              <span>{currentStep === STEPS.length - 1 ? "Launch OpportunityOS Dashboard" : "Continue"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
