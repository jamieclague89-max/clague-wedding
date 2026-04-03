import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Check, AlertCircle, Image, Video, Loader2, ChevronLeft, ChevronRight, User, MessageCircle, Send, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

type EmojiType = "heart" | "like" | "laugh";

const EMOJI_CONFIG: Record<EmojiType, { emoji: string; label: string }> = {
  heart: { emoji: "❤️", label: "Love" },
  like: { emoji: "👍", label: "Like" },
  laugh: { emoji: "😂", label: "Haha" },
};

interface ReactionCounts {
  heart: number;
  like: number;
  laugh: number;
}

interface UserReactions {
  heart: boolean;
  like: boolean;
  laugh: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  uploadedAt: Date;
  uploadedBy: string;
}

interface CloudinaryResource {
  public_id: string;
  resource_type: string;
  secure_url: string;
  format: string;
  created_at: string;
}

interface UploadError {
  file: string;
  message: string;
}

interface PendingFile {
  id: string;
  file: File;
  previewUrl: string;
  type: "image" | "video";
}

interface GalleryComment {
  id: string;
  file_id: string;
  commenter_name: string;
  message: string;
  created_at: string;
}

const MAX_FILE_SIZE = 80 * 1024 * 1024; // 80MB in bytes
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/mov"];

const WeddingGalleryUpload = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<UploadError[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [uploaderName, setUploaderName] = useState(() => localStorage.getItem("weddingGalleryUploaderName") || "");
  const [nameError, setNameError] = useState(false);
  const [reactions, setReactions] = useState<Record<string, ReactionCounts>>({});
  const [userReactions, setUserReactions] = useState<Record<string, UserReactions>>({});
  const [reactingTo, setReactingTo] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, GalleryComment[]>>({});
  const [commentPanelOpen, setCommentPanelOpen] = useState(false);
  const [newCommentName, setNewCommentName] = useState(() => localStorage.getItem("weddingGalleryUploaderName") || "");
  const [newCommentMessage, setNewCommentMessage] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  
  // Initialize Supabase client with memoization to prevent recreation
  const supabase = useMemo<SupabaseClient | null>(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.error("Supabase credentials missing - URL:", !!url, "Key:", !!key);
      return null;
    }
    
    try {
      return createClient(url, key);
    } catch (error) {
      console.error("Failed to create Supabase client:", error);
      return null;
    }
  }, []);

  // Debug env variables on mount
  useEffect(() => {
    console.log("Environment Variables Check:");
    console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL ? "✓ Set" : "✗ Missing");
    console.log("VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing");
    console.log("VITE_CLOUDINARY_CLOUD_NAME:", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ? "✓ Set" : "✗ Missing");
    console.log("VITE_CLOUDINARY_UPLOAD_PRESET:", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ? "✓ Set" : "✗ Missing");
    console.log("Supabase client initialized:", !!supabase);
  }, [supabase]);

  const fetchReactions = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("gallery_reactions")
      .select("file_id, emoji, reactor_name");
    if (error || !data) return;

    const counts: Record<string, ReactionCounts> = {};
    const userR: Record<string, UserReactions> = {};
    const name = localStorage.getItem("weddingGalleryUploaderName") || "";

    data.forEach((row: any) => {
      if (!counts[row.file_id]) counts[row.file_id] = { heart: 0, like: 0, laugh: 0 };
      if (!userR[row.file_id]) userR[row.file_id] = { heart: false, like: false, laugh: false };
      counts[row.file_id][row.emoji as EmojiType]++;
      if (name && row.reactor_name === name) {
        userR[row.file_id][row.emoji as EmojiType] = true;
      }
    });

    setReactions(counts);
    setUserReactions(userR);
  }, [supabase]);

  const fetchComments = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from("gallery_comments")
      .select("*")
      .order("created_at", { ascending: true });
    if (error || !data) return;

    const grouped: Record<string, GalleryComment[]> = {};
    data.forEach((row: GalleryComment) => {
      if (!grouped[row.file_id]) grouped[row.file_id] = [];
      grouped[row.file_id].push(row);
    });
    setComments(grouped);
  }, [supabase]);

  const handleAddComment = useCallback(async (fileId: string) => {
    if (!supabase || !newCommentName.trim() || !newCommentMessage.trim()) return;
    setIsSubmittingComment(true);
    const name = newCommentName.trim();
    localStorage.setItem("weddingGalleryUploaderName", name);
    const { error } = await supabase.from("gallery_comments").insert({
      file_id: fileId,
      commenter_name: name,
      message: newCommentMessage.trim(),
    });
    if (!error) {
      setNewCommentMessage("");
    }
    setIsSubmittingComment(false);
  }, [supabase, newCommentName, newCommentMessage]);

  // Fetch existing images from Supabase on mount
  useEffect(() => {
    if (!supabase) {
      setGalleryError("Database connection not available. Please check configuration.");
      setIsLoadingGallery(false);
      return;
    }
    
    fetchGalleryFiles();
    fetchReactions();
    fetchComments();

    // Subscribe to real-time inserts so the gallery updates automatically
    const channel = supabase
      .channel("gallery_files_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "gallery_files" },
        (payload) => {
          const file = payload.new as any;
          setFiles((prev) => [
            {
              id: file.id,
              name: file.name,
              type: file.type,
              url: file.url,
              uploadedAt: new Date(file.uploaded_at),
              uploadedBy: file.uploaded_by || "Anonymous",
            },
            ...prev,
          ]);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gallery_reactions" },
        () => {
          fetchReactions();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "gallery_comments" },
        (payload) => {
          const row = payload.new as GalleryComment;
          setComments((prev) => {
            const existing = prev[row.file_id] ?? [];
            return { ...prev, [row.file_id]: [...existing, row] };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchReactions, fetchComments]);

  const fetchGalleryFiles = async () => {
    if (!supabase) {
      setGalleryError("Database connection not available. Please check configuration.");
      setIsLoadingGallery(false);
      return;
    }
    
    setIsLoadingGallery(true);
    try {
      console.log("Attempting to fetch gallery files...");

      // Add a timeout so we don't hang forever if Supabase is paused
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out — the database may be unavailable. Please try again later.")), 10000)
      );

      const fetchPromise = supabase
        .from("gallery_files")
        .select("*")
        .order("created_at", { ascending: false });

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        console.error("Error fetching gallery files:", error);
        setGalleryError(`Failed to load gallery: ${error.message}`);
        setFiles([]);
      } else {
        console.log("Gallery files fetched successfully:", data);
        setGalleryError(null);
        const formattedFiles: UploadedFile[] = (data || []).map((file: any) => ({
          id: file.id,
          name: file.name,
          type: file.type,
          url: file.url,
          uploadedAt: new Date(file.uploaded_at),
          uploadedBy: file.uploaded_by || "Anonymous",
        }));
        setFiles(formattedFiles);
      }
    } catch (error) {
      console.error("Error fetching gallery files:", error);
      const message = error instanceof Error ? error.message : "Unknown error loading gallery";
      setGalleryError(message);
      setFiles([]);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds the 80MB size limit. Please choose a smaller file.`;
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return `File "${file.name}" is not a supported format. Please upload images (JPEG, PNG, GIF, WebP, HEIC) or videos (MP4, MOV, WebM).`;
    }

    return null;
  };

  const handleFiles = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploadErrors([]);
    const errors: UploadError[] = [];
    const newPending: PendingFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const error = validateFile(file);
      if (error) {
        errors.push({ file: file.name, message: error });
        continue;
      }
      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const previewUrl = URL.createObjectURL(file);
      newPending.push({
        id: `${file.name}-${file.size}-${Date.now()}-${i}`,
        file,
        previewUrl,
        type: isImage ? "image" : "video",
      });
    }

    if (errors.length > 0) setUploadErrors(errors);
    if (newPending.length > 0) {
      setPendingFiles((prev) => [...prev, ...newPending]);
    }
  }, []);

  const removePendingFile = useCallback((id: string) => {
    setPendingFiles((prev) => {
      const toRemove = prev.find((f) => f.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handleUpload = useCallback(async () => {
    if (pendingFiles.length === 0) return;

    if (!uploaderName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);

    setIsUploading(true);
    setUploadSuccess(false);
    setUploadErrors([]);

    const errors: UploadError[] = [];
    const newFiles: UploadedFile[] = [];

    for (const pending of pendingFiles) {
      try {
        const formData = new FormData();
        formData.append("file", pending.file);
        formData.append("upload_preset", uploadPreset);
        formData.append("tags", "wedding-gallery");
        formData.append("folder", "wedding-gallery");

        const resourceType = pending.type === "image" ? "image" : "video";

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
          { method: "POST", body: formData }
        );

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        newFiles.push({
          id: data.public_id,
          name: pending.file.name,
          type: pending.type,
          url: data.secure_url,
          uploadedAt: new Date(data.created_at),
          uploadedBy: uploaderName.trim(),
        });
      } catch {
        errors.push({
          file: pending.file.name,
          message: `Failed to upload "${pending.file.name}". Please try again.`,
        });
      }
    }

    if (errors.length > 0) setUploadErrors(errors);

    if (newFiles.length > 0 && supabase) {
      const filesToInsert = newFiles.map((file) => ({
        url: file.url,
        name: file.name,
        type: file.type,
        uploaded_by: uploaderName.trim(),
      }));

      const { error: insertError } = await supabase
        .from("gallery_files")
        .insert(filesToInsert);

      if (insertError) {
        setUploadErrors((prev) => [
          ...prev,
          { file: "Gallery", message: "Files uploaded but failed to save to gallery. Please refresh the page." },
        ]);
      } else {
        setUploadSuccess(true);
        // Revoke all object URLs
        setPendingFiles((prev) => {
          prev.forEach((f) => URL.revokeObjectURL(f.previewUrl));
          return [];
        });
        setTimeout(() => setUploadSuccess(false), 3000);
        await fetchGalleryFiles();
      }
    } else if (newFiles.length > 0 && !supabase) {
      setUploadErrors((prev) => [
        ...prev,
        { file: "Gallery", message: "Files uploaded to cloud but database is not available." },
      ]);
    }

    setIsUploading(false);
  }, [pendingFiles, uploaderName, cloudName, uploadPreset, supabase]);

  const handleReaction = useCallback(async (fileId: string, emoji: EmojiType) => {
    if (!supabase) return;
    const name = localStorage.getItem("weddingGalleryUploaderName") || "Anonymous";
    const alreadyReacted = userReactions[fileId]?.[emoji];

    // Optimistic update
    setReactions((prev) => {
      const cur = prev[fileId] || { heart: 0, like: 0, laugh: 0 };
      return {
        ...prev,
        [fileId]: { ...cur, [emoji]: Math.max(0, cur[emoji] + (alreadyReacted ? -1 : 1)) },
      };
    });
    setUserReactions((prev) => {
      const cur = prev[fileId] || { heart: false, like: false, laugh: false };
      return { ...prev, [fileId]: { ...cur, [emoji]: !alreadyReacted } };
    });

    setReactingTo(fileId + emoji);

    if (alreadyReacted) {
      await supabase
        .from("gallery_reactions")
        .delete()
        .eq("file_id", fileId)
        .eq("emoji", emoji)
        .eq("reactor_name", name);
    } else {
      await supabase
        .from("gallery_reactions")
        .upsert({ file_id: fileId, emoji, reactor_name: name }, { onConflict: "file_id,emoji,reactor_name" });
    }

    setReactingTo(null);
  }, [supabase, userReactions]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const dismissError = (index: number) => {
    setUploadErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    setCommentPanelOpen(false);
    setNewCommentMessage("");
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCommentPanelOpen(false);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? files.length - 1 : prev - 1));
    setCommentPanelOpen(false);
    setNewCommentMessage("");
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === files.length - 1 ? 0 : prev + 1));
    setCommentPanelOpen(false);
    setNewCommentMessage("");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, files.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Upload Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-5xl mb-4">The Wedding Gallery</h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Help us capture every special moment! Upload your photos and videos from our wedding day to share with all our guests.
            </p>
            <Separator className="mt-6 max-w-[100px] mx-auto bg-gray-300" />
          </motion.div>

          {/* Upload Instructions */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-white border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <Upload className="h-6 w-6 text-gray-700" />
                  </div>
                  <div>
                    <h3 className="text-lg mb-2">Upload Guidelines</h3>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        <span>Photos: JPEG, PNG, GIF, WebP, HEIC formats accepted</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        <span>Videos: MP4, MOV, WebM formats accepted</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        <span>Maximum file size: 80MB per file</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Upload Box (name + drag-drop + preview) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className={`bg-white ${nameError ? "border-red-400" : "border-gray-200"}`}>
              <CardContent className="p-6 space-y-5">

                {/* Your Name */}
                <div>
                  <Label htmlFor="uploaderName" className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-gray-500" />
                    Your Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="uploaderName"
                    type="text"
                    placeholder="e.g. Sarah & Tom"
                    value={uploaderName}
                    onChange={(e) => {
                      setUploaderName(e.target.value);
                      localStorage.setItem("weddingGalleryUploaderName", e.target.value);
                      if (e.target.value.trim()) setNameError(false);
                    }}
                    className={`w-full ${nameError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                  />
                  {nameError && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Please enter your name before uploading.
                    </p>
                  )}
                </div>

                <Separator className="bg-gray-100" />

                {/* Drag & Drop Zone */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    dragActive
                      ? "border-black bg-gray-100"
                      : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(",")}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                  <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-1 font-medium">
                    Drag & drop your photos and videos here
                  </p>
                  <p className="text-gray-400 text-sm mb-4">or</p>
                  <Button onClick={openFileDialog} variant="outline" size="sm">
                    Browse Files
                  </Button>
                  <p className="text-gray-400 text-xs mt-3">You can select multiple files at once</p>
                </div>

                {/* Pending files preview */}
                {pendingFiles.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        {pendingFiles.length} file{pendingFiles.length !== 1 ? "s" : ""} ready to upload
                      </p>
                      <button
                        onClick={() => {
                          pendingFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
                          setPendingFiles([]);
                        }}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" /> Clear all
                      </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {pendingFiles.map((pf) => (
                        <div key={pf.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                          {pf.type === "image" ? (
                            <img
                              src={pf.previewUrl}
                              alt={pf.file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <Video className="h-8 w-8 text-gray-500" />
                            </div>
                          )}
                          <button
                            onClick={() => removePendingFile(pf.id)}
                            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-white text-[10px] truncate">{pf.file.name}</p>
                          </div>
                        </div>
                      ))}
                      {/* Add more button */}
                      <button
                        onClick={openFileDialog}
                        className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex flex-col items-center justify-center gap-1 transition-all"
                      >
                        <Plus className="h-6 w-6 text-gray-400" />
                        <span className="text-xs text-gray-400">Add more</span>
                      </button>
                    </div>

                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="mt-4 w-full"
                      size="lg"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Uploading {pendingFiles.length} file{pendingFiles.length !== 1 ? "s" : ""}...
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 mr-2" />
                          Upload {pendingFiles.length} file{pendingFiles.length !== 1 ? "s" : ""}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Success Message */}
          <AnimatePresence>
            {uploadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6"
              >
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">Upload successful!</p>
                      <p className="text-green-600 text-sm">
                        Thank you for sharing your memories with us.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Messages */}
          <AnimatePresence>
            {uploadErrors.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 space-y-3"
              >
                {uploadErrors.map((error, index) => (
                  <Card key={index} className="bg-red-50 border-red-200">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-full">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-red-800">Upload failed</p>
                          <p className="text-red-600 text-sm">{error.message}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => dismissError(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Gallery Section */}
      {isLoadingGallery ? (
        <section className="px-4 py-16 bg-white">
          <div className="container mx-auto max-w-4xl text-center">
            <Loader2 className="h-12 w-12 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading gallery...</p>
          </div>
        </section>
      ) : galleryError ? (
        <section className="px-4 py-16 bg-white">
          <div className="container mx-auto max-w-4xl">
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-red-800">Gallery Unavailable</p>
                  <p className="text-red-600 text-sm">{galleryError}</p>
                  <p className="text-red-500 text-xs mt-2">The database may be temporarily unavailable. You can still upload photos using the form below.</p>
                  <button
                    onClick={fetchGalleryFiles}
                    className="mt-3 text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded border border-red-300 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      ) : files.length > 0 ? (
        <section className="px-4 py-16 bg-white">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-heading text-4xl mb-4">Shared Memories</h2>
              <p className="text-gray-600">
                {files.length} {files.length === 1 ? "memory" : "memories"} shared so far
              </p>
              <Separator className="mt-6 max-w-[100px] mx-auto bg-gray-300" />
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative rounded-lg bg-gray-100 group"
                >
                  {/* Image / Video */}
                  <div
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                    onClick={() => openLightbox(index)}
                  >
                    {file.type === "image" ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        <video
                          src={file.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="p-3 bg-white/90 rounded-full">
                            <Video className="h-6 w-6 text-gray-800" />
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Uploader name overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3 text-white/80 flex-shrink-0" />
                        <span className="text-white text-xs truncate">{file.uploadedBy}</span>
                      </div>
                    </div>
                  </div>

                  {/* Reaction bar */}
                  <div className="flex items-center justify-around px-1 py-1.5 bg-white rounded-b-lg border border-t-0 border-gray-100">
                    {(Object.keys(EMOJI_CONFIG) as EmojiType[]).map((emoji) => {
                      const count = reactions[file.id]?.[emoji] ?? 0;
                      const active = userReactions[file.id]?.[emoji] ?? false;
                      const loading = reactingTo === file.id + emoji;
                      return (
                        <button
                          key={emoji}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReaction(file.id, emoji);
                          }}
                          disabled={loading}
                          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs transition-all ${
                            active
                              ? "bg-gray-100 scale-110 font-semibold"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-sm leading-none">{EMOJI_CONFIG[emoji].emoji}</span>
                          {count > 0 && (
                            <span className="text-gray-600 ml-0.5">{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="px-4 py-16 bg-white">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="p-8 bg-gray-50 rounded-xl">
                <Image className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  No photos or videos yet
                </h3>
                <p className="text-gray-400">
                  Be the first to share a memory from our special day!
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && files.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10 z-50"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation Buttons */}
            {files.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm z-50 flex flex-col items-center gap-1">
              <span>{currentImageIndex + 1} / {files.length}</span>
              {files[currentImageIndex]?.uploadedBy && (
                <span className="flex items-center gap-1 text-white/70 text-xs">
                  <User className="h-3 w-3" />
                  {files[currentImageIndex].uploadedBy}
                </span>
              )}
            </div>

            {/* Image/Video Content */}
            <div
              className="max-w-7xl max-h-[85vh] w-full h-full flex items-center justify-center p-4 pb-20"
              onClick={(e) => e.stopPropagation()}
            >
              {files[currentImageIndex].type === "image" ? (
                <img
                  src={files[currentImageIndex].url}
                  alt={files[currentImageIndex].name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={files[currentImageIndex].url}
                  controls
                  className="max-w-full max-h-full"
                  autoPlay
                />
              )}
            </div>

            {/* Bottom Bar: Reactions + Comment Toggle */}
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Reaction Bar */}
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                {(Object.keys(EMOJI_CONFIG) as EmojiType[]).map((emoji) => {
                  const currentFile = files[currentImageIndex];
                  const count = reactions[currentFile.id]?.[emoji] ?? 0;
                  const active = userReactions[currentFile.id]?.[emoji] ?? false;
                  const loading = reactingTo === currentFile.id + emoji;
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(currentFile.id, emoji)}
                      disabled={loading}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                        active
                          ? "bg-white/25 scale-110 font-semibold"
                          : "hover:bg-white/15"
                      }`}
                    >
                      <span className="text-xl leading-none">{EMOJI_CONFIG[emoji].emoji}</span>
                      {count > 0 && (
                        <span className="text-white font-medium text-sm">{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Comment Button */}
              <button
                onClick={() => setCommentPanelOpen((o) => !o)}
                className={`flex items-center gap-2 px-4 py-3 rounded-full backdrop-blur-sm border transition-all duration-200 ${
                  commentPanelOpen
                    ? "bg-white/25 border-white/40 text-white"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }`}
              >
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {(comments[files[currentImageIndex].id] ?? []).length > 0
                    ? (comments[files[currentImageIndex].id] ?? []).length
                    : "Comment"}
                </span>
              </button>
            </div>

            {/* Comment Panel */}
            <AnimatePresence>
              {commentPanelOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-4 top-16 bottom-20 w-80 z-50 flex flex-col"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col h-full overflow-hidden">
                    {/* Panel Header */}
                    <div className="px-4 py-3 border-b border-white/20">
                      <h3 className="text-white font-semibold text-sm">Comments</h3>
                    </div>

                    {/* Comments List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                      {(comments[files[currentImageIndex].id] ?? []).length === 0 ? (
                        <p className="text-white/50 text-sm text-center py-6">
                          Be the first to leave a comment!
                        </p>
                      ) : (
                        (comments[files[currentImageIndex].id] ?? []).map((c) => (
                          <div key={c.id} className="bg-white/10 rounded-xl px-3 py-2.5">
                            <div className="flex items-center gap-1.5 mb-1">
                              <User className="h-3 w-3 text-white/70" />
                              <span className="text-white/90 text-xs font-semibold">{c.commenter_name}</span>
                            </div>
                            <p className="text-white/80 text-sm leading-snug">{c.message}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Comment Input */}
                    <div className="p-3 border-t border-white/20 space-y-2">
                      <Input
                        placeholder="Your name"
                        value={newCommentName}
                        onChange={(e) => setNewCommentName(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm h-8 focus-visible:ring-white/30"
                      />
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Leave a message..."
                          value={newCommentMessage}
                          onChange={(e) => setNewCommentMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAddComment(files[currentImageIndex].id);
                            }
                          }}
                          rows={2}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm resize-none focus-visible:ring-white/30 flex-1"
                        />
                        <button
                          onClick={() => handleAddComment(files[currentImageIndex].id)}
                          disabled={isSubmittingComment || !newCommentName.trim() || !newCommentMessage.trim()}
                          className="self-end p-2 rounded-full bg-white/20 hover:bg-white/30 text-white disabled:opacity-40 transition-all"
                        >
                          {isSubmittingComment ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeddingGalleryUpload;
