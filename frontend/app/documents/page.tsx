"use client";

import { useState, useRef } from "react";
import { FolderGit2, Upload, Trash2, CheckCircle2, FileText, Plus, X, Tag, UploadCloud, FileCheck, ExternalLink } from "lucide-react";
import { useOpportunityStore } from "@/lib/store";

export default function DocumentsPage() {
  const { documents, addDocument, deleteDocument } = useOpportunityStore();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [newDoc, setNewDoc] = useState({
    name: "",
    doc_type: "RESUME",
    url: "",
    tags: "resume, verified",
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    let detectedType = "CERTIFICATE";
    const fname = file.name.toLowerCase();
    if (fname.includes("resume") || fname.includes("cv")) detectedType = "RESUME";
    else if (fname.includes("transcript") || fname.includes("grade") || fname.includes("marks")) detectedType = "TRANSCRIPT";
    else if (fname.includes("recommend") || fname.includes("lor")) detectedType = "RECOMMENDATION";

    setNewDoc((prev) => ({
      ...prev,
      name: file.name,
      doc_type: detectedType,
      tags: `${detectedType.toLowerCase()}, verified`,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const docName = newDoc.name || selectedFile?.name;
    if (!docName) return;

    let fileUrl = newDoc.url;
    if (selectedFile) {
      fileUrl = URL.createObjectURL(selectedFile);
    } else if (!fileUrl) {
      fileUrl = "https://opportunityos-documents.s3.amazonaws.com/" + docName;
    }

    addDocument({
      name: docName,
      doc_type: newDoc.doc_type,
      url: fileUrl,
      file_size_bytes: selectedFile?.size || 154200,
      tags: newDoc.tags ? newDoc.tags.split(",").map((t) => t.trim()) : ["verified"],
    });

    setShowUploadModal(false);
    setSelectedFile(null);
    setNewDoc({ name: "", doc_type: "RESUME", url: "", tags: "resume, verified" });
  };

  const documentTypes = ["RESUME", "TRANSCRIPT", "CERTIFICATE", "RECOMMENDATION"];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-[#42f5e3]" />
            Document Vault
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Encrypted document storage organized for OpportunityOS agent access & auto-attachment.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#42f5e3] hover:bg-[#34e2cf] text-slate-950 text-xs font-bold shadow-[0_0_15px_rgba(66,245,227,0.3)] flex items-center gap-2 transition"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document from Device</span>
        </button>
      </div>

      {/* Document Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {documents.map((doc) => (
          <div key={doc.document_id} className="bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl space-y-4 border border-slate-800 hover:border-[#42f5e3]/40 transition flex flex-col justify-between shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded bg-[#42f5e3]/20 text-[#42f5e3] border border-[#42f5e3]/30">
                  [{doc.doc_type}]
                </span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-[#42f5e3] shrink-0 shadow-inner">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-white leading-snug truncate" title={doc.name}>
                    {doc.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    Size: {((doc.file_size_bytes || 120000) / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {doc.tags?.map((t: string, i: number) => (
                  <span key={i} className="text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5 text-[#42f5e3]" /> {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <a
                href={doc.s3_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#42f5e3] hover:underline font-semibold flex items-center gap-1"
              >
                <span>View / Download</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => deleteDocument(doc.document_id)}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                title="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-5 shadow-2xl relative">
            <button
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#42f5e3]" />
                Upload Document from Device
              </h2>
              <p className="text-xs text-slate-400">
                Select a resume, transcript, certificate, or recommendation file directly from your computer.
              </p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {/* File Dropzone */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                onChange={handleInputChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
                  isDragging
                    ? "border-[#42f5e3] bg-[#42f5e3]/10"
                    : selectedFile
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-slate-800 bg-slate-950 hover:border-[#42f5e3]/50 hover:bg-slate-950/80"
                }`}
              >
                {selectedFile ? (
                  <div className="space-y-1">
                    <FileCheck className="w-8 h-8 text-emerald-400 mx-auto" />
                    <div className="font-bold text-white text-xs truncate max-w-[280px]">
                      {selectedFile.name}
                    </div>
                    <div className="text-[11px] text-emerald-400 font-mono">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready to save
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="text-[10px] text-[#42f5e3] hover:underline font-semibold mt-1 block mx-auto"
                    >
                      Change selected file
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-[#42f5e3]/10 text-[#42f5e3] flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-[#42f5e3] hover:underline">Click to browse file</span>
                      <span className="text-slate-400"> or drag & drop</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      PDF, DOCX, PNG, JPG (Up to 10MB)
                    </p>
                  </>
                )}
              </div>

              {/* Document Name */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sujith_V_Resume_2026.pdf"
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({ ...newDoc, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-[#42f5e3] focus:outline-none"
                />
              </div>

              {/* Document Type */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Document Category</label>
                <select
                  value={newDoc.doc_type}
                  onChange={(e) => setNewDoc({ ...newDoc, doc_type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-[#42f5e3] focus:outline-none"
                >
                  {documentTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Optional URL or Link */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">
                  External S3 / Cloud Link <span className="text-slate-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://... (auto-generated if uploading file above)"
                  value={newDoc.url}
                  onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-[#42f5e3] focus:outline-none text-xs font-mono"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. resume, latest, verified"
                  value={newDoc.tags}
                  onChange={(e) => setNewDoc({ ...newDoc, tags: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:border-[#42f5e3] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#42f5e3] hover:bg-[#34e2cf] text-slate-950 font-extrabold shadow-[0_0_15px_rgba(66,245,227,0.3)] transition"
                >
                  Save Document to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
