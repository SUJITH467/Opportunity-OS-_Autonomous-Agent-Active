"use client";

import React, { useState, useEffect, createContext, useContext, ReactNode } from "react";
import {
  DEMO_STUDENT_PROFILE,
  DEMO_OPPORTUNITIES,
  DEMO_APPLICATIONS,
  DEMO_DOCUMENTS,
  DEMO_ACTIVITIES,
} from "./demo-data";
import { api } from "./api";

const STORAGE_KEYS = {
  PROFILE: "op_os_profile_v1",
  OPPORTUNITIES: "op_os_opps_v1",
  APPLICATIONS: "op_os_apps_v1",
  DOCUMENTS: "op_os_docs_v1",
  ACTIVITIES: "op_os_activities_v1",
  SETTINGS: "op_os_settings_v1",
};

export interface ActivityItem {
  activity_id: string;
  timestamp: string;
  agent_name: string;
  icon?: string;
  summary: string;
  details?: Record<string, any>;
}

export interface SettingsState {
  confidenceThreshold: number;
  requireHumanApproval: boolean;
  autoSubmitReady: boolean;
  discoveryFrequency: string;
  preferredCategories: string[];
}

const DEFAULT_SETTINGS: SettingsState = {
  confidenceThreshold: 0.85,
  requireHumanApproval: true,
  autoSubmitReady: false,
  discoveryFrequency: "Every 6 Hours",
  preferredCategories: ["INTERNSHIP", "HACKATHON", "SCHOLARSHIP", "FELLOWSHIP"],
};

interface OpportunityStoreContextType {
  profile: typeof DEMO_STUDENT_PROFILE;
  opportunities: any[];
  applications: any[];
  documents: any[];
  activities: ActivityItem[];
  settings: SettingsState;
  authToken: string | null;
  isAuthenticated: boolean;
  
  // Actions
  updateProfile: (updated: Partial<typeof DEMO_STUDENT_PROFILE>) => void;
  addOpportunity: (opp: any) => void;
  saveOpportunityToPipeline: (oppId: string) => void;
  updateApplicationStatus: (appId: string, status: string) => void;
  updateApplicationAnswer: (appId: string, questionId: string, answer: string) => void;
  addDocument: (doc: any) => void;
  deleteDocument: (docId: string) => void;
  triggerDiscovery: (customQuery?: string) => void;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  setAuthSession: (token: string, studentProfile?: any) => void;
  logout: () => void;
}

const OpportunityStoreContext = createContext<OpportunityStoreContextType | null>(null);

export function OpportunityStoreProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<typeof DEMO_STUDENT_PROFILE>(DEMO_STUDENT_PROFILE);
  const [opportunities, setOpportunities] = useState<any[]>(DEMO_OPPORTUNITIES);
  const [applications, setApplications] = useState<any[]>(DEMO_APPLICATIONS);
  const [documents, setDocuments] = useState<any[]>(DEMO_DOCUMENTS);
  const [activities, setActivities] = useState<ActivityItem[]>(DEMO_ACTIVITIES);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize from LocalStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("op_os_token_v1");
      if (storedToken) setAuthToken(storedToken);

      const storedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (storedProfile) setProfile(JSON.parse(storedProfile));

      const storedOpps = localStorage.getItem(STORAGE_KEYS.OPPORTUNITIES);
      if (storedOpps) setOpportunities(JSON.parse(storedOpps));

      const storedApps = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      if (storedApps) setApplications(JSON.parse(storedApps));

      const storedDocs = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (storedDocs) setDocuments(JSON.parse(storedDocs));

      const storedActs = localStorage.getItem(STORAGE_KEYS.ACTIVITIES);
      if (storedActs) setActivities(JSON.parse(storedActs));

      const storedSet = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSet) setSettings(JSON.parse(storedSet));
    } catch (e) {
      console.warn("Could not read from localStorage", e);
    }
    setInitialized(true);
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!initialized) return;
    try { localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile)); } catch {}
  }, [profile, initialized]);

  useEffect(() => {
    if (!initialized) return;
    try { localStorage.setItem(STORAGE_KEYS.OPPORTUNITIES, JSON.stringify(opportunities)); } catch {}
  }, [opportunities, initialized]);

  useEffect(() => {
    if (!initialized) return;
    try { localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications)); } catch {}
  }, [applications, initialized]);

  useEffect(() => {
    if (!initialized) return;
    try { localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents)); } catch {}
  }, [documents, initialized]);

  useEffect(() => {
    if (!initialized) return;
    try { localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities)); } catch {}
  }, [activities, initialized]);

  useEffect(() => {
    if (!initialized) return;
    try { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); } catch {}
  }, [settings, initialized]);

  // Actions
  const updateProfile = (updated: Partial<typeof DEMO_STUDENT_PROFILE>) => {
    setProfile((prev) => {
      const next = {
        ...prev,
        ...updated,
        academic: { ...prev.academic, ...(updated.academic || {}) },
        preferences: { ...prev.preferences, ...(updated.preferences || {}) },
      };
      api.saveProfile?.(next).catch(() => {});
      return next;
    });
  };

  const addOpportunity = (newOpp: any) => {
    const oppId = newOpp.opportunity_id || `opp_custom_${Date.now()}`;
    const formattedOpp = {
      opportunity_id: oppId,
      title: newOpp.title,
      organization: newOpp.organization,
      type: newOpp.type || "INTERNSHIP",
      description: newOpp.description || "",
      deadline: newOpp.deadline || "2026-10-30",
      application_url: newOpp.application_url || "https://example.com",
      location: newOpp.location || "Remote",
      is_remote: newOpp.is_remote ?? true,
      stipend_or_reward: newOpp.stipend_or_reward || "Disclosed in application",
      eligibility_criteria: newOpp.eligibility_criteria || ["Undergraduate / Graduate Student"],
      requirements: newOpp.requirements || ["Resume"],
      benefits: newOpp.benefits || ["Networking", "Certificate"],
      overall_score: newOpp.overall_score || 92,
      source: "User Added / Custom Direct Portal",
      score_breakdown: {
        eligibility_score: 95,
        relevance_score: 94,
        skill_match_score: 90,
        deadline_urgency_score: 85,
        opportunity_value_score: 92,
        explanation: "Custom opportunity created by user.",
      },
    };

    setOpportunities((prev) => [formattedOpp, ...prev]);

    // Automatically create application in pipeline
    const newApp = {
      application_id: `app_${oppId}_${Date.now()}`,
      student_id: profile.student_id,
      opportunity_id: oppId,
      opportunity_title: formattedOpp.title,
      organization: formattedOpp.organization,
      status: "SAVED",
      readiness_score: 88,
      overall_score: formattedOpp.overall_score,
      deadline: formattedOpp.deadline,
      required_documents: {
        Resume: "READY",
        Transcript: "READY",
        Certificate: "READY",
      },
      missing_documents: [],
      form_fields: [
        { field_id: "f_name", label: "Full Name", field_type: "text", value: profile.name, suggested_by_ai: true, is_user_edited: false, confidence: 1.0 },
        { field_id: "f_email", label: "Email", field_type: "text", value: profile.email, suggested_by_ai: true, is_user_edited: false, confidence: 1.0 },
        { field_id: "f_college", label: "College", field_type: "text", value: profile.academic.college, suggested_by_ai: true, is_user_edited: false, confidence: 0.98 },
        { field_id: "f_skills", label: "Skills", field_type: "text", value: profile.skills.join(", "), suggested_by_ai: true, is_user_edited: false, confidence: 0.95 },
      ],
      generated_answers: [
        {
          question_id: "q_custom_1",
          question: `Why are you applying for ${formattedOpp.title}?`,
          answer: `I am passionate about ${formattedOpp.type.toLowerCase()} opportunities in ${profile.skills.slice(0, 3).join(", ")}. My technical background and projects make me a strong candidate.`,
          approved: true,
          original_ai_answer: `I want to apply for ${formattedOpp.title}.`,
        },
      ],
    };

    setApplications((prev) => [newApp, ...prev]);

    // Append activity
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setActivities((prev) => [
      {
        activity_id: `act_${Date.now()}`,
        timestamp: timeStr,
        agent_name: "Opportunity Agent",
        icon: "✨",
        summary: `Created custom opportunity: "${formattedOpp.title}" and initialized application pipeline`,
        details: { opp_id: oppId },
      },
      ...prev,
    ]);
  };

  const saveOpportunityToPipeline = (oppId: string) => {
    const opp = opportunities.find((o) => o.opportunity_id === oppId);
    if (!opp) return;

    const existingApp = applications.find((a) => a.opportunity_id === oppId);
    if (existingApp) return;

    const newApp = {
      application_id: `app_${oppId}_${Date.now()}`,
      student_id: profile.student_id,
      opportunity_id: oppId,
      opportunity_title: opp.title,
      organization: opp.organization,
      status: "SAVED",
      readiness_score: 90,
      overall_score: opp.overall_score || 90,
      deadline: opp.deadline,
      required_documents: {
        Resume: "READY",
        Transcript: "READY",
        Certificate: "READY",
      },
      missing_documents: [],
      form_fields: [
        { field_id: "f_name", label: "Full Name", field_type: "text", value: profile.name, suggested_by_ai: true, is_user_edited: false, confidence: 1.0 },
        { field_id: "f_email", label: "Email", field_type: "text", value: profile.email, suggested_by_ai: true, is_user_edited: false, confidence: 1.0 },
        { field_id: "f_college", label: "College", field_type: "text", value: profile.academic.college, suggested_by_ai: true, is_user_edited: false, confidence: 0.98 },
        { field_id: "f_skills", label: "Skills", field_type: "text", value: profile.skills.join(", "), suggested_by_ai: true, is_user_edited: false, confidence: 0.95 },
      ],
      generated_answers: [
        {
          question_id: "q_auto_1",
          question: `Why are you a good fit for ${opp.title}?`,
          answer: `My background in ${profile.academic.department} and skills in ${profile.skills.slice(0, 4).join(", ")} directly align with ${opp.organization}'s criteria.`,
          approved: true,
          original_ai_answer: `I match the requirements for ${opp.title}.`,
        },
      ],
    };

    setApplications((prev) => [newApp, ...prev]);
  };

  const updateApplicationStatus = (appId: string, status: string) => {
    setApplications((prev) =>
      prev.map((app) => (app.application_id === appId ? { ...app, status } : app))
    );
    api.approveApplication?.(appId, profile.name).catch(() => {});
  };

  const updateApplicationAnswer = (appId: string, questionId: string, answer: string) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.application_id !== appId) return app;
        const updatedAnswers = app.generated_answers.map((ans) =>
          ans.question_id === questionId ? { ...ans, answer, approved: true } : ans
        );
        return { ...app, generated_answers: updatedAnswers };
      })
    );
    api.updateAnswer?.(appId, questionId, answer).catch(() => {});
  };

  const addDocument = (doc: any) => {
    const newDoc = {
      document_id: `doc_${Date.now()}`,
      student_id: profile.student_id,
      name: doc.name || "Uploaded_Document.pdf",
      doc_type: doc.doc_type || "CERTIFICATE",
      s3_key: `students/${profile.student_id}/${doc.name}`,
      s3_url: doc.url || `https://opportunityos-documents.s3.amazonaws.com/${doc.name}`,
      file_size_bytes: doc.file_size_bytes || 154200,
      tags: doc.tags || ["user-added"],
    };

    setDocuments((prev) => [newDoc, ...prev]);

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setActivities((prev) => [
      {
        activity_id: `act_${Date.now()}`,
        timestamp: timeStr,
        agent_name: "Document Vault Agent",
        icon: "📁",
        summary: `Added new document "${newDoc.name}" to Student Vault`,
        details: { doc_id: newDoc.document_id, type: newDoc.doc_type },
      },
      ...prev,
    ]);
  };

  const deleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.document_id !== docId));
  };

  const triggerDiscovery = (customQuery?: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newActivities = [
      {
        activity_id: `act_disc_${Date.now()}_1`,
        timestamp: timeStr,
        agent_name: "Discovery Agent",
        icon: "🔎",
        summary: customQuery ? `Executing query "${customQuery}" across 12 opportunity APIs` : "Scanned 12 online developer portals & scholarship registries",
        details: { channels: 12 },
      },
      {
        activity_id: `act_disc_${Date.now()}_2`,
        timestamp: timeStr,
        agent_name: "Eligibility Agent",
        icon: "🧠",
        summary: `Filtered results against ${profile.name}'s profile (${profile.academic.cgpa} CGPA, ${profile.skills.length} skills)`,
        details: { matched: 6 },
      },
    ];

    setActivities((prev) => [...newActivities, ...prev]);
    api.triggerDiscovery?.().catch(() => {});
  };

  const updateSettings = (newSettings: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const setAuthSession = (token: string, studentProfile?: any) => {
    setAuthToken(token);
    try {
      localStorage.setItem("op_os_token_v1", token);
    } catch {}
    if (studentProfile) {
      updateProfile(studentProfile);
    }
  };

  const logout = () => {
    setAuthToken(null);
    try {
      localStorage.removeItem("op_os_token_v1");
    } catch {}
  };

  return (
    <OpportunityStoreContext.Provider
      value={{
        profile,
        opportunities,
        applications,
        documents,
        activities,
        settings,
        authToken,
        isAuthenticated: Boolean(authToken),
        updateProfile,
        addOpportunity,
        saveOpportunityToPipeline,
        updateApplicationStatus,
        updateApplicationAnswer,
        addDocument,
        deleteDocument,
        triggerDiscovery,
        updateSettings,
        setAuthSession,
        logout,
      }}
    >
      {children}
    </OpportunityStoreContext.Provider>
  );
}

export function useOpportunityStore() {
  const context = useContext(OpportunityStoreContext);
  if (!context) {
    throw new Error("useOpportunityStore must be used within an OpportunityStoreProvider");
  }
  return context;
}
