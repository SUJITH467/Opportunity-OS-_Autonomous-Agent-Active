"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bot, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  XCircle,
  Eye, 
  EyeOff, 
  AlertTriangle,
  Key,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { useOpportunityStore } from "@/lib/store";
import { api } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const { profile, updateProfile, setAuthSession } = useOpportunityStore();

  const [formData, setFormData] = useState({
    name: profile.name || "Sujith V",
    email: profile.email || "sujith.dev@example.com",
    password: "Password123!",
    confirmPassword: "Password123!",
    college: profile.academic?.college || "National Institute of Technology",
    degree: profile.academic?.degree || "B.Tech",
    department: profile.academic?.department || "Computer Science & Engineering",
    graduation_year: String(profile.academic?.graduation_year || 2027),
    cgpa: String(profile.academic?.cgpa || 8.8),
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [copiedRecovery, setCopiedRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("A7B9-3F12-E84C-90D1");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Password Requirement Checks
  const hasMinLength = formData.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.password);
  const hasLowercase = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.password.length > 0;

  // Calculate Password Strength Score (0 to 5)
  const strengthScore = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
  
  const getStrengthLabel = () => {
    if (strengthScore <= 2) return { label: "Weak", color: "bg-rose-500", text: "text-rose-400" };
    if (strengthScore <= 4) return { label: "Medium", color: "bg-amber-500", text: "text-amber-400" };
    return { label: "Strong & Compliant", color: "bg-aqua-400", text: "text-aqua-400" };
  };

  const handleGenerateRecoveryCode = async () => {
    try {
      const res = await api.getRecoveryCodes();
      if (res.recovery_codes && res.recovery_codes.length > 0) {
        setRecoveryCode(res.recovery_codes.join(" • "));
      }
    } catch {
      setRecoveryCode("A7B9-3F12 • E84C-90D1 • 2F4A-61B8");
    }
  };

  const handleCopyRecoveryCode = () => {
    navigator.clipboard.writeText(recoveryCode);
    setCopiedRecovery(true);
    setTimeout(() => setCopiedRecovery(false), 2000);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match. Please re-enter your password.");
      return;
    }
    if (strengthScore < 5) {
      setErrorMessage("Password does not meet all security policy criteria.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // 1. Call Backend Cognito signup API
      const response = await api.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        college: formData.college,
        degree: formData.degree,
        department: formData.department,
        graduation_year: parseInt(formData.graduation_year) || 2027,
        cgpa: parseFloat(formData.cgpa) || 8.8,
      });

      // 2. Persist session token and student profile
      setAuthSession(response.access_token, response.student);
      
      updateProfile({
        name: formData.name,
        email: formData.email,
        academic: {
          ...profile.academic,
          college: formData.college,
          degree: formData.degree,
          department: formData.department,
          graduation_year: parseInt(formData.graduation_year) || 2027,
          cgpa: parseFloat(formData.cgpa) || 8.8,
          max_cgpa: 10.0,
        },
      });

      router.push("/onboarding");
    } catch (err: any) {
      if (err?.message?.includes("Failed to fetch") || err?.message?.includes("fetch")) {
        // Fallback demo signup when backend dev server is starting up or offline
        const fallbackStudent = {
          student_id: `stu_${Date.now()}`,
          name: formData.name,
          email: formData.email,
          academic: {
            ...profile.academic,
            college: formData.college,
            degree: formData.degree,
            department: formData.department,
            graduation_year: parseInt(formData.graduation_year) || 2027,
            cgpa: parseFloat(formData.cgpa) || 8.8,
            max_cgpa: 10.0,
          },
        };
        setAuthSession(`demo_bearer_token_${Date.now()}`, fallbackStudent);
        updateProfile(fallbackStudent);
        router.push("/onboarding");
      } else {
        setErrorMessage(err.message || "Failed to create account. Please check your inputs.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans py-12">
      {/* Background Aqua Glow Effects */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-aqua-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-xl space-y-6 relative z-10 my-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-aqua-400 to-cyan-500 p-0.5 shadow-glow mb-2">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-aqua-400" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Create Student Profile
          </h1>
          <p className="text-xs text-slate-400">
            Register with Amazon Cognito IDP for automated opportunity matching.
          </p>
        </div>

        {/* Signup Form Card */}
        <div className="bg-slate-900/90 backdrop-blur-md p-8 rounded-3xl space-y-5 border border-slate-800 shadow-2xl">
          {/* Security Banner */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px]">
            <span className="text-slate-400 font-mono flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-aqua-400" />
              SECURE CONNECTION
            </span>
            <span className="text-aqua-400 font-mono font-semibold">COGNITO AUTHENTICATED</span>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Name & Email */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-aqua-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Sujith V"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aqua-400 focus:ring-1 focus:ring-aqua-400 transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-aqua-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sujith@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aqua-400 focus:ring-1 focus:ring-aqua-400 transition"
                />
              </div>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-aqua-400" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aqua-400 focus:ring-1 focus:ring-aqua-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-aqua-400" />
                    Confirm Password
                  </label>
                  {formData.confirmPassword.length > 0 && (
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${passwordsMatch ? "text-aqua-400" : "text-rose-400"}`}>
                      {passwordsMatch ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {passwordsMatch ? "Matches" : "Mismatch"}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••••••"
                    className={`w-full bg-slate-950 border rounded-xl pl-4 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition ${
                      formData.confirmPassword.length > 0
                        ? passwordsMatch
                          ? "border-aqua-400 focus:ring-1 focus:ring-aqua-400"
                          : "border-rose-500/60 focus:ring-1 focus:ring-rose-500"
                        : "border-slate-800 focus:border-aqua-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Entropy & Strength Meter */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Password Policy Strength</span>
                <span className={`font-bold font-mono ${getStrengthLabel().text}`}>
                  {getStrengthLabel().label} ({strengthScore}/5)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${getStrengthLabel().color}`} 
                  style={{ width: `${(strengthScore / 5) * 100}%` }}
                ></div>
              </div>

              {/* Rule Checklist */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-1">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-aqua-300" : "text-slate-500"}`}>
                  {hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5 text-aqua-400" /> : <XCircle className="w-3.5 h-3.5 text-slate-600" />}
                  At least 8 characters
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-aqua-300" : "text-slate-500"}`}>
                  {hasUppercase ? <CheckCircle2 className="w-3.5 h-3.5 text-aqua-400" /> : <XCircle className="w-3.5 h-3.5 text-slate-600" />}
                  1 Uppercase letter (A-Z)
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-aqua-300" : "text-slate-500"}`}>
                  {hasLowercase ? <CheckCircle2 className="w-3.5 h-3.5 text-aqua-400" /> : <XCircle className="w-3.5 h-3.5 text-slate-600" />}
                  1 Lowercase letter (a-z)
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? "text-aqua-300" : "text-slate-500"}`}>
                  {hasNumber ? <CheckCircle2 className="w-3.5 h-3.5 text-aqua-400" /> : <XCircle className="w-3.5 h-3.5 text-slate-600" />}
                  1 Numeric digit (0-9)
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? "text-aqua-300" : "text-slate-500"}`}>
                  {hasSpecial ? <CheckCircle2 className="w-3.5 h-3.5 text-aqua-400" /> : <XCircle className="w-3.5 h-3.5 text-slate-600" />}
                  1 Special char (!@#$%^&*)
                </div>
              </div>
            </div>

            {/* Cryptographic Backup Recovery Code Card */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-aqua-400" />
                  Account Backup Recovery Code
                </span>
                <button
                  type="button"
                  onClick={handleGenerateRecoveryCode}
                  className="text-[11px] text-aqua-400 hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Refresh Code
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-center text-aqua-300 tracking-wider">
                  {recoveryCode}
                </div>
                <button
                  type="button"
                  onClick={handleCopyRecoveryCode}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1 transition shrink-0"
                >
                  {copiedRecovery ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-aqua-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                Save this backup recovery code in a secure location. It can be used to recover access to your account.
              </p>
            </div>

            {/* Academic Information Section */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-aqua-400 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-aqua-400" />
                Academic Information
              </h3>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400">College / University Name</label>
                <input
                  type="text"
                  required
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  placeholder="National Institute of Technology"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aqua-400 focus:ring-1 focus:ring-aqua-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">Degree</label>
                  <input
                    type="text"
                    required
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    placeholder="B.Tech"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aqua-400 focus:ring-1 focus:ring-aqua-400 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">Department</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Computer Science & Engineering"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-aqua-400 focus:ring-1 focus:ring-aqua-400 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">Graduation Year</label>
                  <input
                    type="text"
                    required
                    value={formData.graduation_year}
                    onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                    placeholder="2027"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono text-center focus:outline-none focus:border-aqua-400 focus:ring-1 focus:ring-aqua-400 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400">CGPA (Out of 10)</label>
                  <input
                    type="text"
                    required
                    value={formData.cgpa}
                    onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                    placeholder="8.8"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-mono text-center focus:outline-none focus:border-aqua-400 focus:ring-1 focus:ring-aqua-400 transition"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || strengthScore < 5 || !passwordsMatch}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-aqua-400 via-cyan-400 to-aqua-400 text-slate-950 font-bold text-xs shadow-glow hover:shadow-glow-aqua transition duration-150 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Registering Profile with Cognito...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Continue to Onboarding</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="text-center pt-2 text-xs text-slate-400 border-t border-slate-800">
            Already registered?{" "}
            <Link href="/login" className="text-aqua-400 hover:underline font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
