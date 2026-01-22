import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Check, AlertCircle, Image, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  // Fetch existing images from Cloudinary on mount
  useEffect(() => {
    fetchCloudinaryImages();
  }, []);

  const fetchCloudinaryImages = async () => {
    setIsLoadingGallery(true);
    try {
      // Fetch images by tag using the public list endpoint
      const imageResponse = await fetch(
        `https://res.cloudinary.com/${cloudName}/image/list/wedding-gallery.json`
      );
      
      let allFiles: UploadedFile[] = [];
      
      if (imageResponse.ok) {
        const imageData = await imageResponse.json();
        const images: UploadedFile[] = imageData.resources.map((resource: any) => ({
          id: resource.public_id,
          name: resource.public_id.split('/').pop() || 'Untitled',
          type: 'image' as const,
          url: `https://res.cloudinary.com/${cloudName}/image/upload/${resource.public_id}.${resource.format}`,
          uploadedAt: new Date(resource.created_at),
        }));
        allFiles = [...allFiles, ...images];
      }
      
      // Also fetch videos
      const videoResponse = await fetch(
        `https://res.cloudinary.com/${cloudName}/video/list/wedding-gallery.json`
      );
      
      if (videoResponse.ok) {
        const videoData = await videoResponse.json();
        const videos: UploadedFile[] = videoData.resources.map((resource: any) => ({
          id: resource.public_id,
          name: resource.public_id.split('/').pop() || 'Untitled',
          type: 'video' as const,
          url: `https://res.cloudinary.com/${cloudName}/video/upload/${resource.public_id}.${resource.format}`,
          uploadedAt: new Date(resource.created_at),
        }));
        allFiles = [...allFiles, ...videos];
      }
      
      setFiles(allFiles);
    } catch (error) {
      console.error("Error fetching Cloudinary images:", error);
      // Don't show errors to user, just start with empty gallery
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

    if (newFiles.length > 0) {
      setFiles((prev) => [...newFiles, ...prev]);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }

    setIsUploading(false);
  }, [cloudName, uploadPreset]);

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
                    <h3 className="font-semibold text-lg mb-2">Upload Guidelines</h3>
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
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group"
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
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">{file.name}</p>
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
    </div>
  );
};

export default WeddingGalleryUpload;
