"use client";

import { useState } from "react";
import { Sparkles, Edit3, Check } from "lucide-react";
import { useOpportunityStore } from "@/lib/store";

interface AnswerEditorProps {
  applicationId: string;
  question: any;
  onAnswerUpdated?: () => void;
}

export default function AnswerEditor({ applicationId, question, onAnswerUpdated }: AnswerEditorProps) {
  const { updateApplicationAnswer } = useOpportunityStore();
  const [isEditing, setIsEditing] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState(question.answer);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    updateApplicationAnswer(applicationId, question.question_id, currentAnswer);
    setIsSaved(true);
    setIsEditing(false);
    setTimeout(() => setIsSaved(false), 2000);
    if (onAnswerUpdated) onAnswerUpdated();
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative group">
      <div className="flex items-start justify-between">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-aqua-400"></span>
          {question.question}
        </h4>
        <span className="text-[10px] bg-aqua-400/15 text-aqua-300 border border-aqua-400/30 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-aqua-400" /> AI Grounded Answer
        </span>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            rows={4}
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            className="w-full bg-slate-950 border border-aqua-400/50 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-aqua-400 leading-relaxed font-sans"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-aqua-400 hover:bg-aqua-300 text-slate-950 text-xs font-bold shadow-glow-aqua flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Save Response
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 relative">
          <p className="text-xs text-slate-300 leading-relaxed font-sans">{currentAnswer}</p>

          <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 italic">
              {isSaved ? "✓ Saved to Application Memory" : "AI generated from verified student profile."}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition border border-slate-700/50"
              >
                <Edit3 className="w-3 h-3 text-aqua-400" />
                Edit Answer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
