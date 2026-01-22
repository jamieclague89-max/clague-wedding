import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Check, AlertCircle, Image, Video, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface UploadedFile {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
  thumbnail?: string;
  uploadedAt: Date;
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

  // Fetch existing images from Supabase on mount
  useEffect(() => {
    if (!supabase) {
      setGalleryError("Database connection not available. Please check configuration.");
      setIsLoadingGallery(false);
      return;
    }
    
    fetchGalleryFiles();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel("gallery_files_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gallery_files" },
        (payload) => {
          // Refresh gallery when changes occur
          fetchGalleryFiles();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase]);

  const fetchGalleryFiles = async () => {
    if (!supabase) {
      setGalleryError("Database connection not available. Please check configuration.");
      setIsLoadingGallery(false);
      return;
    }
    
    setIsLoadingGallery(true);
    try {
      console.log("Attempting to fetch gallery files...");

      const { data, error } = await supabase
        .from("gallery_files")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching gallery files:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
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
        }));
        setFiles(formattedFiles);
      }
    } catch (error) {
      console.error("Error fetching gallery files:", error);
      setGalleryError(error instanceof Error ? error.message : "Unknown error loading gallery");
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

    setIsUploading(true);
    setUploadSuccess(false);
    setUploadErrors([]);

    const errors: UploadError[] = [];
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const error = validateFile(file);

      if (error) {
        errors.push({ file: file.name, message: error });
        continue;
      }

      try {
        // Upload to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        formData.append("tags", "wedding-gallery");
        formData.append("folder", "wedding-gallery");

        const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
        const resourceType = isImage ? "image" : "video";

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();

        newFiles.push({
          id: data.public_id,
          name: file.name,
          type: isImage ? "image" : "video",
          url: data.secure_url,
          uploadedAt: new Date(data.created_at),
        });
      } catch (err) {
        errors.push({
          file: file.name,
          message: `Failed to upload "${file.name}". Please try again.`,
        });
      }
    }

    if (errors.length > 0) {
      setUploadErrors(errors);
    }

    if (newFiles.length > 0 && supabase) {
      // Save to Supabase
      const filesToInsert = newFiles.map((file) => ({
        url: file.url,
        name: file.name,
        type: file.type,
      }));

      const { error: insertError } = await supabase
        .from("gallery_files")
        .insert(filesToInsert);

      if (insertError) {
        console.error("Error saving to gallery:", insertError);
        setUploadErrors([
          ...uploadErrors,
          {
            file: "Gallery",
            message: "Files uploaded but failed to save to gallery. Please refresh the page.",
          },
        ]);
      } else {
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
        // Refresh gallery to show new files
        await fetchGalleryFiles();
      }
    } else if (newFiles.length > 0 && !supabase) {
      setUploadErrors([
        ...uploadErrors,
        {
          file: "Gallery",
          message: "Files uploaded to cloud but database is not available.",
        },
      ]);
    }

    setIsUploading(false);
  }, [cloudName, uploadPreset, supabase]);

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
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? files.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev === files.length - 1 ? 0 : prev + 1));
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

          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
                dragActive
                  ? "border-black bg-gray-100"
                  : "border-gray-300 bg-white hover:border-gray-400"
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

              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-12 w-12 text-gray-400 animate-spin mb-4" />
                  <p className="text-gray-600 font-medium">Uploading your files...</p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop your photos and videos here
                  </p>
                  <p className="text-gray-400 text-sm mb-4">or</p>
                  <Button onClick={openFileDialog} variant="outline" size="lg">
                    Browse Files
                  </Button>
                </>
              )}
            </div>
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
                  <p className="font-medium text-red-800">Gallery Error</p>
                  <p className="text-red-600 text-sm">{galleryError}</p>
                  <p className="text-red-500 text-xs mt-2">Please refresh the page or contact support if the problem persists.</p>
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
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
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
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm z-50">
              {currentImageIndex + 1} / {files.length}
            </div>

            {/* Image/Video Content */}
            <div
              className="max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center p-4"
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WeddingGalleryUpload;
