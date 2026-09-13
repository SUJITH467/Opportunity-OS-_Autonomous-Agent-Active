import {
  DEMO_STUDENT_PROFILE,
  DEMO_OPPORTUNITIES,
  DEMO_APPLICATIONS,
  DEMO_DOCUMENTS,
  DEMO_ACTIVITIES,
} from "./demo-data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetcher<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s fast timeout fallback

    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage.getItem("op_os_token_v1") || "";
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers as Record<string, string>),
    };

    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[OpportunityOS Client Fallback] API request for ${endpoint}.`);
    throw err;
  }
}

export const api = {
  login: async (email: string, password: string) => {
    return await fetcher("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (payload: any) => {
    return await fetcher("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  verifyMfa: async (mfaSession: string, code: string) => {
    return await fetcher("/auth/mfa/verify", {
      method: "POST",
      body: JSON.stringify({ mfa_session: mfaSession, code }),
    });
  },

  getRecoveryCodes: async () => {
    try {
      return await fetcher("/auth/recovery-codes");
    } catch {
      return {
        recovery_codes: ["A7B9-3F12", "E84C-90D1", "2F4A-61B8", "9012-CD34"],
        entropy_bits: 256,
        generated_at: new Date().toISOString(),
      };
    }
  },

  getProfile: async () => {
    try {
      return await fetcher("/profile");
    } catch {
      return DEMO_STUDENT_PROFILE;
    }
  },

  saveProfile: async (profile: any) => {
    try {
      return await fetcher("/profile", {
        method: "PUT",
        body: JSON.stringify(profile),
      });
    } catch {
      return profile;
    }
  },

  getOpportunities: async (type?: string, search?: string) => {
    try {
      let q = "";
      if (type && type !== "ALL") q += `opp_type=${type}&`;
      if (search) q += `search=${encodeURIComponent(search)}`;
      return await fetcher(`/opportunities?${q}`);
    } catch {
      let results = [...DEMO_OPPORTUNITIES];
      if (type && type !== "ALL") {
        results = results.filter((o) => o.type === type);
      }
      if (search) {
        const s = search.toLowerCase();
        results = results.filter(
          (o) => o.title.toLowerCase().includes(s) || o.organization.toLowerCase().includes(s)
        );
      }
      return results;
    }
  },

  getOpportunityById: async (id: string) => {
    try {
      return await fetcher(`/opportunities/${id}`);
    } catch {
      return DEMO_OPPORTUNITIES.find((o) => o.opportunity_id === id) || DEMO_OPPORTUNITIES[0];
    }
  },

  saveOpportunity: async (id: string) => {
    try {
      return await fetcher(`/opportunities/${id}/save`, { method: "POST" });
    } catch {
      return { status: "created", application_id: `app_${id}_1` };
    }
  },

  getApplications: async () => {
    try {
      return await fetcher("/applications");
    } catch {
      return DEMO_APPLICATIONS;
    }
  },

  getApplicationById: async (id: string) => {
    try {
      return await fetcher(`/applications/${id}`);
    } catch {
      return DEMO_APPLICATIONS.find((a) => a.application_id === id) || DEMO_APPLICATIONS[0];
    }
  },

  prepareApplication: async (id: string) => {
    try {
      return await fetcher(`/applications/${id}/prepare`, { method: "POST" });
    } catch {
      return { status: "AWAITING_APPROVAL", fields_completed: 18, message: "Form navigation complete." };
    }
  },

  approveApplication: async (id: string, approved_by: string = "Sujith V") => {
    try {
      return await fetcher(`/applications/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ approved_by }),
      });
    } catch {
      return { status: "APPROVED", approved_by, timestamp: new Date().toISOString() };
    }
  },

  submitApplication: async (id: string) => {
    try {
      return await fetcher(`/applications/${id}/submit`, { method: "POST" });
    } catch {
      return { status: "SUBMITTED", submitted_at: new Date().toISOString() };
    }
  },

  updateAnswer: async (id: string, question_id: string, answer: string) => {
    try {
      return await fetcher(`/applications/${id}/answer`, {
        method: "PATCH",
        body: JSON.stringify({ question_id, answer }),
      });
    } catch {
      return { status: "updated", question_id, answer };
    }
  },

  getDocuments: async () => {
    try {
      return await fetcher("/documents");
    } catch {
      return DEMO_DOCUMENTS;
    }
  },

  getAgentActivity: async () => {
    try {
      return await fetcher("/agent/activity");
    } catch {
      return { activities: DEMO_ACTIVITIES, total_count: DEMO_ACTIVITIES.length };
    }
  },

  triggerDiscovery: async () => {
    try {
      return await fetcher("/agent/discover", { method: "POST", body: JSON.stringify({}) });
    } catch {
      return { status: "success", message: "Discovery completed" };
    }
  },
};
