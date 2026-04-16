import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Trash2,
  Tag,
  User,
  MessageCircle,
  ChevronDown,
  Upload,
  X,
  Check,
  AlertCircle,
  Image,
  Video,
  Plus,
  Lock,
  Eye,
  EyeOff,
  Play,
  Search,
} from "lucide-react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ADMIN_PASSWORD = "Pu**ycat16";

const CATEGORIES = [
  "Pre-Wedding",
  "Ceremony",
  "Getting Ready",
  "Reception",
  "Highlights",
  "Speeches",
  "Trend Videos",
  "Promo Video",
];

interface GalleryFile {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
  uploaded_at: string;
  uploaded_by: string;
  category?: string;
}

interface GalleryComment {
  id: string;
  file_id: string;
  commenter_name: string;
  message: string;
  created_at: string;
}

interface PendingFile {
  id: string;
  file: File;
  previewUrl: string;
  type: "image" | "video";
}

interface UploadError {
  file: string;
  message: string;
}

const getCloudinaryThumb = (url: string): string => {
  const uploadMarker = "/upload/";
  const idx = url.indexOf(uploadMarker);
  if (idx === -1) return url;
  const base = url.slice(0, idx + uploadMarker.length);
  const rest = url.slice(idx + uploadMarker.length);
  return `${base}w_300,h_300,c_fill,q_auto,f_auto/${rest}`;
};

// ─── Login Screen ────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_auth", "true");
      onLogin();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 border border-white/20 rounded-full mb-6">
            <Lock className="h-7 w-7 text-white/70" />
          </div>
          <h1 className="text-2xl font-semibold text-white tracking-wide mb-1">Admin Portal</h1>
          <p className="text-white/40 text-sm tracking-widest uppercase">Jamie & Alexandra's Wedding</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="w-full bg-white/5 border border-white/20 text-white placeholder:text-white/30 px-4 py-3 pr-12 focus:outline-none focus:border-white/50 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs text-center"
            >
              Incorrect password. Please try again.
            </motion.p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-white text-black text-xs tracking-widest uppercase font-semibold hover:bg-white/90 transition-all"
          >
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
const AdminPanel = ({ onLogout }: { onLogout: () => void }) => {
  const [files, setFiles] = useState<GalleryFile[]>([]);
  const [comments, setComments] = useState<Record<string, GalleryComment[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingCategory, setUpdatingCategory] = useState<string | null>(null);
  const [deletingComment, setDeletingComment] = useState<string | null>(null);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState("");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Upload state
  const [uploaderName, setUploaderName] = useState("Admin");
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadErrors, setUploadErrors] = useState<UploadError[]>([]);
  const [uploadedCount, setUploadedCount] = useState(0);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const supabase = useMemo<SupabaseClient | null>(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    try { return createClient(url, key); } catch { return null; }
  }, []);

  const fetchData = useCallback(async () => {
    if (!supabase) { setError("Database not available."); setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const [filesRes, commentsRes] = await Promise.all([
        supabase.from("gallery_files").select("*").order("uploaded_at", { ascending: false }),
        supabase.from("gallery_comments").select("*").order("created_at", { ascending: true }),
      ]);
      if (filesRes.error) throw filesRes.error;
      if (commentsRes.error) throw commentsRes.error;
      setFiles(filesRes.data || []);
      const grouped: Record<string, GalleryComment[]> = {};
      (commentsRes.data || []).forEach((c: GalleryComment) => {
        if (!grouped[c.file_id]) grouped[c.file_id] = [];
        grouped[c.file_id].push(c);
      });
      setComments(grouped);
    } catch (e: any) {
      setError(e.message || "Failed to load data.");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    document.title = "Admin | Jamie & Alex";
    fetchData();
  }, [fetchData]);

  const handleCategoryChange = useCallback(async (fileId: string, category: string) => {
    if (!supabase) return;
    setUpdatingCategory(fileId);
    const value = category === "" ? null : category;
    const { error } = await supabase.from("gallery_files").update({ category: value }).eq("id", fileId);
    if (!error) {
      setFiles((prev) =>
        prev.map((f) => f.id === fileId ? { ...f, category: value || undefined } : f)
      );
    }
    setUpdatingCategory(null);
  }, [supabase]);

  const handleDeleteComment = useCallback(async (commentId: string, fileId: string) => {
    if (!supabase) return;
    setDeletingComment(commentId);
    const { error } = await supabase.from("gallery_comments").delete().eq("id", commentId);
    if (!error) {
      setComments((prev) => {
        const updated = (prev[fileId] || []).filter((c) => c.id !== commentId);
        return { ...prev, [fileId]: updated };
      });
    }
    setDeletingComment(null);
  }, [supabase]);

  const handleDeleteFile = useCallback(async (fileId: string) => {
    if (!supabase) return;
    setDeletingFile(fileId);
    const { error } = await supabase.from("gallery_files").delete().eq("id", fileId);
    if (!error) {
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(fileId); return next; });
    }
    setDeletingFile(null);
  }, [supabase]);

  const toggleSelect = (fileId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  // toggleSelectAll is called inline in JSX where filteredFiles is in scope
  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkCategoryApply = useCallback(async (categoryOverride?: string) => {
    const cat = categoryOverride !== undefined ? categoryOverride : bulkCategory;
    if (!supabase || selectedIds.size === 0 || cat === "") return;
    setIsBulkUpdating(true);
    const value = cat === "__clear__" ? null : cat;
    const ids = Array.from(selectedIds);
    const { error } = await supabase
      .from("gallery_files")
      .update({ category: value })
      .in("id", ids);
    if (!error) {
      setFiles((prev) =>
        prev.map((f) => selectedIds.has(f.id) ? { ...f, category: value || undefined } : f)
      );
      setSelectedIds(new Set());
      setBulkCategory("");
    }
    setIsBulkUpdating(false);
  }, [supabase, selectedIds, bulkCategory]);

  const handleBulkDelete = useCallback(async () => {
    if (!supabase || selectedIds.size === 0) return;
    setIsBulkDeleting(true);
    const ids = Array.from(selectedIds);
    const { error } = await supabase.from("gallery_files").delete().in("id", ids);
    if (!error) {
      setFiles((prev) => prev.filter((f) => !selectedIds.has(f.id)));
      setSelectedIds(new Set());
    }
    setIsBulkDeleting(false);
    setShowDeleteConfirm(false);
  }, [supabase, selectedIds]);

  const toggleComments = (fileId: string) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  // Upload logic
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const newFiles: PendingFile[] = [];
    Array.from(selectedFiles).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) return;
      const previewUrl = URL.createObjectURL(file);
      newFiles.push({ id: crypto.randomUUID(), file, previewUrl, type: isImage ? "image" : "video" });
    });
    setPendingFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removePendingFile = useCallback((id: string) => {
    setPendingFiles((prev) => {
      const f = prev.find((p) => p.id === id);
      if (f) URL.revokeObjectURL(f.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const uploadToCloudinary = useCallback(async (pendingFile: PendingFile): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const formData = new FormData();
    formData.append("file", pendingFile.file);
    formData.append("upload_preset", uploadPreset);
    const resourceType = pendingFile.type === "video" ? "video" : "image";
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
    const xhr = new XMLHttpRequest();
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploadProgress((prev) => ({ ...prev, [pendingFile.id]: pct }));
        }
      });
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve(data.secure_url);
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });
      xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
      xhr.open("POST", url);
      xhr.send(formData);
    });
  }, []);

  const handleUpload = useCallback(async () => {
    if (!supabase || !uploaderName.trim() || pendingFiles.length === 0) return;
    setIsUploading(true);
    setUploadErrors([]);
    setUploadedCount(0);
    let successCount = 0;

    for (const pf of pendingFiles) {
      try {
        setUploadProgress((prev) => ({ ...prev, [pf.id]: 0 }));
        const url = await uploadToCloudinary(pf);
        const { error } = await supabase.from("gallery_files").insert({
          name: pf.file.name,
          type: pf.type,
          url,
          uploaded_by: uploaderName.trim(),
        });
        if (error) throw error;
        successCount++;
        setUploadedCount(successCount);
      } catch (e: any) {
        setUploadErrors((prev) => [...prev, { file: pf.file.name, message: e.message || "Upload failed" }]);
      }
    }

    setIsUploading(false);
    if (successCount > 0) {
      setPendingFiles([]);
      setUploadProgress({});
      fetchData();
    }
  }, [supabase, uploaderName, pendingFiles, uploadToCloudinary, fetchData]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const filteredFiles = useMemo(() => {
    let result = [...files];
    if (filterCategory !== "all") {
      result = result.filter((f) =>
        filterCategory === "uncategorised"
          ? !f.category
          : f.category === filterCategory
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.uploaded_by || "").toLowerCase().includes(q) ||
          (f.category || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [files, filterCategory, searchQuery]);

  const stats = useMemo(() => {
    const totalComments = Object.values(comments).reduce((s, arr) => s + arr.length, 0);
    const uncategorised = files.filter((f) => !f.category).length;
    const images = files.filter((f) => f.type === "image").length;
    const videos = files.filter((f) => f.type === "video").length;
    return { totalComments, uncategorised, images, videos };
  }, [files, comments]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <nav className="bg-black text-white sticky top-0 z-50 border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/images/J-A Wedding Logo.png" alt="Logo" className="h-10 w-auto object-contain brightness-0 invert" />
            <div className="h-6 w-px bg-white/20" />
            <span className="text-sm tracking-widest uppercase text-white/70">Admin Portal</span>
          </div>
          <button
            onClick={onLogout}
            className="text-xs tracking-widest uppercase text-white/50 hover:text-white transition-colors border border-white/20 hover:border-white/50 px-4 py-2"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-6 py-8 max-w-7xl pb-24">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Files", value: files.length },
            { label: "Images", value: stats.images },
            { label: "Videos", value: stats.videos },
            { label: "Uncategorised", value: stats.uncategorised, warn: stats.uncategorised > 0 },
            { label: "Comments", value: stats.totalComments },
          ].slice(0, 4).map((s) => (
            <div key={s.label} className={`bg-white border ${s.warn ? "border-amber-200 bg-amber-50" : "border-gray-200"} rounded-lg p-5`}>
              <p className="text-3xl font-bold text-black">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1 tracking-wide uppercase">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Upload Section Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setShowUploadSection((v) => !v)}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white text-xs tracking-widest uppercase hover:bg-black/80 transition-all"
          >
            <Upload className="h-4 w-4" />
            {showUploadSection ? "Hide Upload" : "Bulk Upload Files"}
          </button>
        </div>

        {/* Upload Section */}
        <AnimatePresence>
          {showUploadSection && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-black mb-4 tracking-wide">Bulk Upload</h2>
                <div className="mb-4">
                  <Label className="text-xs tracking-widest uppercase text-gray-500 mb-1 block">Upload As (name)</Label>
                  <Input
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    placeholder="Admin"
                    className="max-w-xs"
                  />
                </div>

                {/* Drop Zone */}
                <div
                  ref={dropZoneRef}
                  onDrop={onDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:border-black hover:bg-gray-50 transition-all"
                >
                  <Upload className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Drop files here or <span className="underline text-black">click to browse</span></p>
                  <p className="text-xs text-gray-400 mt-1">Images & Videos supported</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                </div>

                {/* Pending previews */}
                {pendingFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-3 tracking-wide uppercase">{pendingFiles.length} file(s) ready</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {pendingFiles.map((pf) => (
                        <div key={pf.id} className="relative aspect-square bg-gray-100 rounded overflow-hidden group">
                          {pf.type === "image" ? (
                            <img src={pf.previewUrl} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Video className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          {uploadProgress[pf.id] !== undefined && uploadProgress[pf.id] < 100 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <span className="text-white text-xs font-semibold">{uploadProgress[pf.id]}%</span>
                            </div>
                          )}
                          {uploadProgress[pf.id] === 100 && (
                            <div className="absolute inset-0 bg-green-500/70 flex items-center justify-center">
                              <Check className="h-5 w-5 text-white" />
                            </div>
                          )}
                          {!isUploading && (
                            <button
                              onClick={(e) => { e.stopPropagation(); removePendingFile(pf.id); }}
                              className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {uploadErrors.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {uploadErrors.map((e, i) => (
                          <p key={i} className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> {e.file}: {e.message}
                          </p>
                        ))}
                      </div>
                    )}

                    {uploadedCount > 0 && !isUploading && (
                      <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                        <Check className="h-3 w-3" /> {uploadedCount} file(s) uploaded successfully
                      </p>
                    )}

                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={handleUpload}
                        disabled={isUploading || !uploaderName.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 bg-black text-white text-xs tracking-widest uppercase hover:bg-black/80 disabled:opacity-50 transition-all"
                      >
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {isUploading ? `Uploading (${uploadedCount}/${pendingFiles.length})...` : "Upload All"}
                      </button>
                      {!isUploading && (
                        <button
                          onClick={() => { setPendingFiles([]); setUploadProgress({}); setUploadErrors([]); }}
                          className="px-4 py-2.5 border border-gray-300 text-xs tracking-widest uppercase text-gray-600 hover:border-black hover:text-black transition-all"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Media Management */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
            <h2 className="text-lg font-semibold text-black flex-1">Media Management</h2>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 focus:outline-none focus:border-black rounded-sm w-48"
              />
            </div>
            {/* Category filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-sm border border-gray-200 px-3 py-2 focus:outline-none focus:border-black rounded-sm"
            >
              <option value="all">All Categories</option>
              <option value="uncategorised">Uncategorised</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="text-sm text-gray-400">{filteredFiles.length} of {files.length} files</span>
          </div>

          {/* Bulk action bar */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 80 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 80 }}
                className="fixed bottom-0 left-0 right-0 z-50 shadow-lg"
              >
                <div className="px-5 py-3 bg-blue-50 border-t border-blue-200 flex flex-wrap items-center gap-3 max-w-screen-2xl mx-auto">
                  <span className="text-sm font-semibold text-blue-800">{selectedIds.size} selected</span>
                  <div className="h-4 w-px bg-blue-200" />
                  {/* Bulk category */}
                  <div className="flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                    <select
                      value={bulkCategory}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBulkCategory(val);
                        if (val !== "") handleBulkCategoryApply(val);
                      }}
                      disabled={isBulkUpdating}
                      className="text-xs border border-blue-200 bg-white px-2 py-1.5 focus:outline-none focus:border-blue-500 rounded-sm disabled:opacity-60"
                    >
                      <option value="">— Set Category —</option>
                      <option value="__clear__">Clear / Uncategorise</option>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {isBulkUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />}
                  </div>
                  <div className="h-4 w-px bg-blue-200" />
                  {/* Bulk delete */}
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs rounded-sm hover:bg-red-100 transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete {selectedIds.size} file{selectedIds.size > 1 ? "s" : ""}
                  </button>
                  <button
                    onClick={clearSelection}
                    className="ml-auto text-xs text-blue-500 hover:text-blue-800 transition-colors"
                  >
                    Clear selection
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bulk delete confirmation */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Trash2 className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">Delete {selectedIds.size} file{selectedIds.size > 1 ? "s" : ""}?</h3>
                      <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 text-sm text-gray-600 hover:border-black hover:text-black transition-all rounded-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50 transition-all rounded-sm flex items-center justify-center gap-2"
                    >
                      {isBulkDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Delete
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-red-500 text-sm mb-3">{error}</p>
              <button onClick={fetchData} className="text-xs underline text-gray-500 hover:text-black">Retry</button>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">No files found.</div>
          ) : (
            <>
              {/* Select all row */}
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.size === filteredFiles.length && filteredFiles.length > 0}
                  onChange={() => {
                    if (selectedIds.size === filteredFiles.length) {
                      setSelectedIds(new Set());
                    } else {
                      setSelectedIds(new Set(filteredFiles.map((f) => f.id)));
                    }
                  }}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
                <span className="text-xs text-gray-500">
                  {selectedIds.size === filteredFiles.length && filteredFiles.length > 0
                    ? "Deselect all"
                    : `Select all ${filteredFiles.length} visible`}
                </span>
              </div>
            <div className="divide-y divide-gray-100">
              {filteredFiles.map((file) => {
                const fileComments = comments[file.id] || [];
                const commentsExpanded = expandedComments.has(file.id);

                return (
                  <div
                    key={file.id}
                    className={`p-4 transition-colors ${selectedIds.has(file.id) ? "bg-blue-50" : "hover:bg-gray-50/50"}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div className="flex-shrink-0 pt-1">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(file.id)}
                          onChange={() => toggleSelect(file.id)}
                          className="w-4 h-4 accent-black cursor-pointer"
                        />
                      </div>

                      {/* Thumbnail */}
                      <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded overflow-hidden relative">
                        {file.type === "image" ? (
                          <img
                            src={getCloudinaryThumb(file.url)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <Play className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                        <span className={`absolute bottom-1 right-1 text-white text-xs px-1 rounded ${file.type === "video" ? "bg-black/70" : "bg-black/50"}`}>
                          {file.type === "image" ? "IMG" : "VID"}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black truncate mb-1">{file.name}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mb-3">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {file.uploaded_by || "Anonymous"}
                          </span>
                          <span>
                            {new Date(file.uploaded_at).toLocaleDateString("en-GB", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                        </div>

                        {/* Category selector */}
                        <div className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                          <div className="relative">
                            <select
                              value={file.category || ""}
                              onChange={(e) => handleCategoryChange(file.id, e.target.value)}
                              disabled={updatingCategory === file.id}
                              className={`text-xs border px-3 py-1.5 pr-7 appearance-none focus:outline-none focus:border-black rounded-sm transition-all ${
                                file.category
                                  ? "border-black text-black bg-white font-medium"
                                  : "border-amber-300 text-amber-600 bg-amber-50"
                              }`}
                            >
                              <option value="">— Uncategorised —</option>
                              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                          </div>
                          {updatingCategory === file.id && (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Right actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Comment toggle */}
                        <button
                          onClick={() => toggleComments(file.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-all rounded-sm ${
                            commentsExpanded
                              ? "bg-black text-white border-black"
                              : fileComments.length > 0
                              ? "border-gray-300 text-gray-600 hover:border-black hover:text-black"
                              : "border-gray-200 text-gray-400"
                          }`}
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          {fileComments.length > 0 ? fileComments.length : "0"}
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          disabled={deletingFile === file.id}
                          title="Delete file"
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all disabled:opacity-50"
                        >
                          {deletingFile === file.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Trash2 className="h-4 w-4" />
                          }
                        </button>
                      </div>
                    </div>

                    {/* Comments panel */}
                    <AnimatePresence>
                      {commentsExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 ml-24 border border-gray-100 rounded-lg overflow-hidden">
                            {fileComments.length === 0 ? (
                              <p className="text-xs text-gray-400 px-4 py-3 text-center">No comments on this file.</p>
                            ) : (
                              <div className="divide-y divide-gray-100">
                                {fileComments.map((comment) => (
                                  <div key={comment.id} className="flex items-start justify-between px-4 py-3 gap-3 hover:bg-gray-50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs font-semibold text-black">{comment.commenter_name}</span>
                                        <span className="text-xs text-gray-400">
                                          {new Date(comment.created_at).toLocaleDateString("en-GB", {
                                            day: "numeric", month: "short", year: "numeric",
                                          })}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700 leading-snug">{comment.message}</p>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteComment(comment.id, file.id)}
                                      disabled={deletingComment === comment.id}
                                      className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all disabled:opacity-50"
                                      title="Delete comment"
                                    >
                                      {deletingComment === comment.id ? (
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-3.5 w-3.5" />
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Admin Page (handles auth) ────────────────────────────────────────────────
const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem("admin_auth") === "true"
  );

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />;
  return <AdminPanel onLogout={handleLogout} />;
};

export default Admin;
