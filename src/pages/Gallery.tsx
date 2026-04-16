import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Image,
  Video,
  Loader2,
  ChevronLeft,
  ChevronRight,
  User,
  MessageCircle,
  Send,
  Download,
  ArrowUpDown,
  Play,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import BackToTop from "@/components/BackToTop";

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

interface GalleryFile {
  id: string;
  name: string;
  type: "image" | "video";
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
  category?: string;
}

interface GalleryComment {
  id: string;
  file_id: string;
  commenter_name: string;
  message: string;
  created_at: string;
}

type SortOrder = "newest" | "oldest" | "most_liked";

const CATEGORIES = [
  "All",
  "Pre-Wedding",
  "Ceremony",
  "Getting Ready",
  "Reception",
  "Highlights",
  "Speeches",
  "Trend Videos",
  "Promo Video",
];

const ITEMS_PER_PAGE = 12;

const getCloudinaryThumb = (url: string): string => {
  const uploadMarker = "/upload/";
  const idx = url.indexOf(uploadMarker);
  if (idx === -1) return url;
  const base = url.slice(0, idx + uploadMarker.length);
  const rest = url.slice(idx + uploadMarker.length);
  return `${base}w_600,h_600,c_fill,q_auto,f_auto/${rest}`;
};

const Gallery = () => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [files, setFiles] = useState<GalleryFile[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reactions, setReactions] = useState<Record<string, ReactionCounts>>({});
  const [userReactions, setUserReactions] = useState<Record<string, UserReactions>>({});
  const [reactingTo, setReactingTo] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, GalleryComment[]>>({});
  const [commentPanelOpen, setCommentPanelOpen] = useState(false);
  const [newCommentName, setNewCommentName] = useState(
    () => localStorage.getItem("weddingGalleryUploaderName") || ""
  );
  const [newCommentMessage, setNewCommentMessage] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [filterUploader, setFilterUploader] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [slideshowActive, setSlideshowActive] = useState(false);
  const slideshowTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const supabase = useMemo<SupabaseClient | null>(() => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    try {
      return createClient(url, key);
    } catch {
      return null;
    }
  }, []);

  const uniqueUploaders = useMemo(() => {
    const names = files.map((f) => f.uploadedBy).filter(Boolean);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [files]);

  const uniqueDates = useMemo(() => {
    const dateSet = new Set<string>();
    files.forEach((f) => {
      const d = new Date(f.uploadedAt);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      dateSet.add(`${yyyy}-${mm}-${dd}`);
    });
    return Array.from(dateSet).sort((a, b) => b.localeCompare(a));
  }, [files]);

  const sortedFiles = useMemo(() => {
    let result = [...files];

    if (activeCategory !== "All") {
      result = result.filter((f) => f.category === activeCategory);
    }
    if (filterUploader === "professional") {
      result = result.filter((f) => f.uploadedBy === "Professional Photos");
    } else if (filterUploader === "guest") {
      result = result.filter((f) => f.uploadedBy !== "Professional Photos");
    }
    if (filterDate) {
      result = result.filter((f) => {
        const d = new Date(f.uploadedAt);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}` === filterDate;
      });
    }
    if (sortOrder === "most_liked") {
      result.sort((a, b) => {
        const totalA = Object.values(reactions[a.id] ?? { heart: 0, like: 0, laugh: 0 }).reduce((s, v) => s + v, 0);
        const totalB = Object.values(reactions[b.id] ?? { heart: 0, like: 0, laugh: 0 }).reduce((s, v) => s + v, 0);
        return totalB - totalA;
      });
    } else if (sortOrder === "oldest") {
      result.reverse();
    }
    return result;
  }, [files, reactions, sortOrder, filterUploader, filterDate, activeCategory]);

  const fetchReactions = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from("gallery_reactions").select("file_id, emoji, reactor_name");
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

  const fetchGalleryFiles = useCallback(async () => {
    if (!supabase) {
      setGalleryError("Database connection not available.");
      setIsLoadingGallery(false);
      return;
    }
    setIsLoadingGallery(true);
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out.")), 10000)
      );
      const fetchPromise = supabase
        .from("gallery_files")
        .select("*")
        .order("created_at", { ascending: false });
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);
      if (error) {
        setGalleryError(`Failed to load gallery: ${error.message}`);
        setFiles([]);
      } else {
        setGalleryError(null);
        const formattedFiles: GalleryFile[] = (data || []).map((file: any) => ({
          id: file.id,
          name: file.name,
          type: file.type,
          url: file.url,
          uploadedAt: new Date(file.uploaded_at),
          uploadedBy: file.uploaded_by || "Anonymous",
          category: file.category || undefined,
        }));
        setFiles(formattedFiles);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error loading gallery";
      setGalleryError(message);
      setFiles([]);
    } finally {
      setIsLoadingGallery(false);
    }
  }, [supabase]);

  useEffect(() => {
    document.title = "Gallery | Jamie & Alex";
    if (!supabase) {
      setGalleryError("Database connection not available.");
      setIsLoadingGallery(false);
      return;
    }
    fetchGalleryFiles();
    fetchReactions();
    fetchComments();

    const channel = supabase
      .channel("gallery_page_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "gallery_files" }, (payload) => {
        const file = payload.new as any;
        setFiles((prev) => [
          {
            id: file.id,
            name: file.name,
            type: file.type,
            url: file.url,
            uploadedAt: new Date(file.uploaded_at),
            uploadedBy: file.uploaded_by || "Anonymous",
            category: file.category || undefined,
          },
          ...prev,
        ]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "gallery_files" }, (payload) => {
        const file = payload.new as any;
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? { ...f, category: file.category || undefined }
              : f
          )
        );
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "gallery_files" }, (payload) => {
        const file = payload.old as any;
        setFiles((prev) => prev.filter((f) => f.id !== file.id));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "gallery_reactions" }, () => {
        fetchReactions();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "gallery_comments" }, (payload) => {
        const row = payload.new as GalleryComment;
        setComments((prev) => {
          const existing = prev[row.file_id] ?? [];
          return { ...prev, [row.file_id]: [...existing, row] };
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchReactions, fetchComments, fetchGalleryFiles]);

  const handleReaction = useCallback(
    async (fileId: string, emoji: EmojiType) => {
      if (!supabase) return;
      const name = localStorage.getItem("weddingGalleryUploaderName") || "Anonymous";
      const alreadyReacted = userReactions[fileId]?.[emoji];
      setReactions((prev) => {
        const cur = prev[fileId] || { heart: 0, like: 0, laugh: 0 };
        return { ...prev, [fileId]: { ...cur, [emoji]: Math.max(0, cur[emoji] + (alreadyReacted ? -1 : 1)) } };
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
    },
    [supabase, userReactions]
  );

  const handleAddComment = useCallback(
    async (fileId: string) => {
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
        fetchComments();
      }
      setIsSubmittingComment(false);
    },
    [supabase, newCommentName, newCommentMessage, fetchComments]
  );

  const handleDownload = useCallback(
    async (file: GalleryFile) => {
      try {
        const response = await fetch(file.url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name || `wedding-memory`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        window.open(file.url, "_blank");
      }
    },
    []
  );

  const handleShare = useCallback(async (file: GalleryFile) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Wedding Memory – Jamie & Alex",
          text: `Check out this memory from Jamie & Alex's wedding! Uploaded by ${file.uploadedBy}`,
          url: file.url,
        });
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(file.url);
        alert("Link copied to clipboard!");
      } catch {
        window.open(file.url, "_blank");
      }
    }
  }, []);

  const openLightbox = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    setCommentPanelOpen(false);
    setNewCommentMessage("");
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setCommentPanelOpen(false);
    setSlideshowActive(false);
    if (slideshowTimerRef.current) {
      clearInterval(slideshowTimerRef.current);
      slideshowTimerRef.current = null;
    }
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === 0 ? sortedFiles.length - 1 : prev - 1));
    setCommentPanelOpen(false);
    setNewCommentMessage("");
  }, [sortedFiles.length]);

  const goToNext = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === sortedFiles.length - 1 ? 0 : prev + 1));
    setCommentPanelOpen(false);
    setNewCommentMessage("");
  }, [sortedFiles.length]);

  // Slideshow
  const toggleSlideshow = useCallback(() => {
    if (!slideshowActive) {
      if (!lightboxOpen) {
        openLightbox(0);
      }
      setSlideshowActive(true);
    } else {
      setSlideshowActive(false);
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
        slideshowTimerRef.current = null;
      }
    }
  }, [slideshowActive, lightboxOpen, openLightbox]);

  useEffect(() => {
    if (slideshowActive) {
      slideshowTimerRef.current = setInterval(() => {
        goToNext();
      }, 4000);
    } else {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
        slideshowTimerRef.current = null;
      }
    }
    return () => {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    };
  }, [slideshowActive, goToNext]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, goToPrevious, goToNext, closeLightbox]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      touchStartX.current = null;
      touchStartY.current = null;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) goToNext();
        else goToPrevious();
      }
    },
    [goToNext, goToPrevious]
  );

  const scrollToGallery = () => {
    galleryRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero Banner */}
      <section className="relative h-screen min-h-[600px] overflow-hidden">
        <img
          src={`${window.location.origin}/images/Alex-Jamie-Hero-Banner.jpg`}
          alt="Alex & Jamie"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-12 flex justify-between items-end">
          {/* Left: Title */}
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-heading text-5xl md:text-7xl text-white leading-tight mb-2"
            >
              The Clague Wedding
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-white/70 text-base md:text-lg tracking-widest uppercase"
            >
              2nd April – 4th April 2026
            </motion.p>
          </div>

          {/* Right: View Gallery button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            onClick={scrollToGallery}
            className="border border-white text-white text-xs tracking-widest uppercase px-6 py-3 hover:bg-white hover:text-black transition-all duration-300 hidden sm:block"
          >
            View Gallery
          </motion.button>
        </div>

        {/* Mobile view gallery button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          onClick={scrollToGallery}
          className="sm:hidden absolute bottom-6 right-6 border border-white text-white text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-white hover:text-black transition-all"
        >
          View Gallery
        </motion.button>
      </section>

      {/* Gallery Section */}
      <section ref={galleryRef} className="bg-white text-black">
        {/* Category Filters + Slideshow */}
        <div className="sticky top-[calc(55px+32px)] md:top-[calc(55px+32px)] bg-white border-b border-gray-100 z-40">
          <div className="container mx-auto px-4 md:px-6 py-0">
            {/* Desktop: categories + slideshow side by side */}
            <div className="hidden md:flex items-center justify-between gap-4">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1 py-4">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setVisibleCount(ITEMS_PER_PAGE);
                    }}
                    className={`whitespace-nowrap px-4 py-1.5 text-xs tracking-widest uppercase transition-all border rounded-none flex-shrink-0 ${
                      activeCategory === cat
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-black"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button
                onClick={toggleSlideshow}
                className={`flex items-center gap-2 px-5 py-2 text-xs tracking-widest uppercase border transition-all flex-shrink-0 ${
                  slideshowActive
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-black hover:bg-black hover:text-white"
                }`}
              >
                <Play className="h-3.5 w-3.5" />
                {slideshowActive ? "Stop" : "Play Slideshow"}
              </button>
            </div>

            {/* Mobile: categories full-width scrollable, slideshow below */}
            <div className="md:hidden flex flex-col">
              <div className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full py-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setVisibleCount(ITEMS_PER_PAGE);
                    }}
                    className={`whitespace-nowrap px-4 py-1.5 text-xs tracking-widest uppercase transition-all border rounded-none flex-shrink-0 ${
                      activeCategory === cat
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-black"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="pb-3">
                <button
                  onClick={toggleSlideshow}
                  className={`flex items-center justify-center gap-2 w-full px-5 py-2 text-xs tracking-widest uppercase border transition-all ${
                    slideshowActive
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-black hover:bg-black hover:text-white"
                  }`}
                >
                  <Play className="h-3.5 w-3.5" />
                  {slideshowActive ? "Stop" : "Play Slideshow"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sort / Filter Controls */}
        {!isLoadingGallery && !galleryError && files.length > 0 && (
          <div className="container mx-auto px-4 md:px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              {/* Filter buttons — left */}
              <div className="flex items-stretch gap-2">
                {(["all", "professional", "guest"] as const).map((val) => (
                  <button
                    key={val}
                    onClick={() => { setFilterUploader(val); setVisibleCount(ITEMS_PER_PAGE); }}
                    className={`flex items-center justify-center px-4 py-1.5 min-h-[2.5rem] text-xs tracking-wide uppercase transition-all border leading-tight text-center ${
                      filterUploader === val
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {val === "all" ? "Everyone" : val === "professional" ? "Professional Photos" : "Guest Photos"}
                  </button>
                ))}
              </div>

              {/* Sort buttons — right */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500 mr-1">Sort:</span>
                {(["newest", "oldest", "most_liked"] as SortOrder[]).map((order) => (
                  <button
                    key={order}
                    onClick={() => setSortOrder(order)}
                    className={`px-4 py-1.5 text-xs tracking-wide uppercase transition-all border ${
                      sortOrder === order
                        ? "bg-black text-white border-black"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {order === "newest" ? "Newest" : order === "oldest" ? "Oldest" : "Most Liked"}
                  </button>
                ))}
              </div>
            </div>


          </div>
        )}

        {/* Gallery Grid */}
        <div className="container mx-auto px-4 md:px-6 py-8">
          {isLoadingGallery ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="h-12 w-12 text-gray-300 animate-spin mb-4" />
              <p className="text-gray-400 text-sm tracking-widest uppercase">Loading gallery...</p>
            </div>
          ) : galleryError ? (
            <div className="py-16 text-center">
              <p className="text-red-500 mb-4">{galleryError}</p>
              <button
                onClick={fetchGalleryFiles}
                className="px-6 py-2 border border-black text-sm tracking-widest uppercase hover:bg-black hover:text-white transition-all"
              >
                Retry
              </button>
            </div>
          ) : sortedFiles.length === 0 ? (
            <div className="py-32 text-center">
              <Image className="h-16 w-16 text-gray-200 mx-auto mb-4" />
              {activeCategory !== "All" ? (
                <>
                  <p className="text-gray-400 text-sm tracking-widest uppercase">No memories in "{activeCategory}" yet</p>
                  <button
                    onClick={() => setActiveCategory("All")}
                    className="mt-4 text-xs text-gray-500 underline hover:text-black transition-colors"
                  >
                    View all memories
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-400 text-sm tracking-widest uppercase">No memories uploaded yet</p>
                  <p className="text-gray-300 text-xs mt-2">Be the first to share!</p>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Count */}
              <p className="text-xs text-gray-400 tracking-widest uppercase mb-6">
                {sortedFiles.length !== files.length
                  ? `${sortedFiles.length} of ${files.length} memories`
                  : `${files.length} ${files.length === 1 ? "memory" : "memories"}`}
              </p>

              {/* 3-column grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
                {sortedFiles.slice(0, visibleCount).map((file) => {
                  const index = sortedFiles.findIndex((f) => f.id === file.id);
                  return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative aspect-square bg-gray-100 group overflow-hidden cursor-pointer"
                    onClick={() => openLightbox(index)}
                  >
                    {/* Media */}
                    {file.type === "image" ? (
                      <img
                        src={getCloudinaryThumb(file.url)}
                        alt={`Photo by ${file.uploadedBy}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className="relative w-full h-full"
                      >
                        <video
                          src={file.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          preload="none"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full border border-white/40">
                            <Play className="h-7 w-7 text-white" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none group-hover:pointer-events-auto">
                      {/* Top: uploader name */}
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-white/80" />
                        <span className="text-white text-xs font-medium truncate">{file.uploadedBy}</span>
                      </div>

                      {/* Bottom: reactions + actions */}
                      <div className="flex flex-col gap-2">
                        {/* Emoji reactions */}
                        <div className="flex items-center gap-1">
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
                                className={`flex items-center gap-0.5 px-2 py-1 rounded-full text-xs transition-all ${
                                  active
                                    ? "bg-white/30 scale-110 font-semibold"
                                    : "hover:bg-white/20"
                                }`}
                              >
                                <span className="text-base leading-none">{EMOJI_CONFIG[emoji].emoji}</span>
                                {count > 0 && <span className="text-white ml-0.5">{count}</span>}
                              </button>
                            );
                          })}
                          {/* Comment */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openLightbox(index);
                              setCommentPanelOpen(true);
                            }}
                            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs hover:bg-white/20 transition-colors ml-1"
                          >
                            <MessageCircle className="h-4 w-4 text-white" />
                            {(comments[file.id] ?? []).length > 0 && (
                              <span className="text-white">{(comments[file.id] ?? []).length}</span>
                            )}
                          </button>
                        </div>

                        {/* Action icons: download + share */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(file);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white text-xs transition-all backdrop-blur-sm"
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>Download</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(file);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white text-xs transition-all backdrop-blur-sm"
                            title="Share"
                          >
                            <Share2 className="h-3.5 w-3.5" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                  );
                })}
              </div>

              {/* Load more */}
              {visibleCount < sortedFiles.length && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
                    className="px-12 py-4 border border-black text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-all duration-300"
                  >
                    Load more ({sortedFiles.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="font-heading text-2xl mb-4">Jamie & Alexandra</p>
          <p className="text-sm text-gray-400">2nd April – 4th April 2026</p>
          <p className="text-xs text-gray-500 mt-6">&copy; {new Date().getFullYear()} • Jamie & Alexandra's Wedding Website</p>
          <p className="text-xs text-gray-500 mt-2">Website designed and built by Jamie Clague</p>
        </div>
      </footer>

      <BackToTop />

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && sortedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10 z-50"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Download */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-16 text-white hover:bg-white/10 z-50"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(sortedFiles[currentImageIndex]);
              }}
              title="Download"
            >
              <Download className="h-5 w-5" />
            </Button>

            {/* Share */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-28 text-white hover:bg-white/10 z-50"
              onClick={(e) => {
                e.stopPropagation();
                handleShare(sortedFiles[currentImageIndex]);
              }}
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </Button>

            {/* Slideshow indicator */}
            {slideshowActive && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-xs tracking-widest uppercase">Slideshow</span>
                </div>
              </div>
            )}

            {/* Nav arrows */}
            {sortedFiles.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-50"
                  onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10 z-50"
                  onClick={(e) => { e.stopPropagation(); goToNext(); }}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}

            {/* Counter + uploader */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-sm z-50 flex flex-col items-center gap-1">
              {!slideshowActive && (
                <>
                  <span>{currentImageIndex + 1} / {sortedFiles.length}</span>
                  {sortedFiles[currentImageIndex]?.uploadedBy && (
                    <span className="flex items-center gap-1 text-white/70 text-xs">
                      <User className="h-3 w-3" />
                      {sortedFiles[currentImageIndex].uploadedBy}
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Image/Video */}
            <div
              className="max-w-7xl max-h-[85vh] w-full h-full flex items-center justify-center p-4 pb-24"
              onClick={(e) => e.stopPropagation()}
            >
              {sortedFiles[currentImageIndex].type === "image" ? (
                <img
                  src={sortedFiles[currentImageIndex].url}
                  alt={`Photo by ${sortedFiles[currentImageIndex].uploadedBy}`}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={sortedFiles[currentImageIndex].url}
                  controls
                  className="max-w-full max-h-full"
                  autoPlay
                />
              )}
            </div>

            {/* Bottom bar: reactions + comment */}
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
                {(Object.keys(EMOJI_CONFIG) as EmojiType[]).map((emoji) => {
                  const currentFile = sortedFiles[currentImageIndex];
                  const count = reactions[currentFile.id]?.[emoji] ?? 0;
                  const active = userReactions[currentFile.id]?.[emoji] ?? false;
                  const loading = reactingTo === currentFile.id + emoji;
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(currentFile.id, emoji)}
                      disabled={loading}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                        active ? "bg-white/25 scale-110 font-semibold" : "hover:bg-white/15"
                      }`}
                    >
                      <span className="text-xl leading-none">{EMOJI_CONFIG[emoji].emoji}</span>
                      {count > 0 && <span className="text-white font-medium text-sm">{count}</span>}
                    </button>
                  );
                })}
              </div>

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
                  {(comments[sortedFiles[currentImageIndex].id] ?? []).length > 0
                    ? (comments[sortedFiles[currentImageIndex].id] ?? []).length
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
                    <div className="px-4 py-3 border-b border-white/20">
                      <h3 className="text-white font-semibold text-sm">Comments</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                      {(comments[sortedFiles[currentImageIndex].id] ?? []).length === 0 ? (
                        <p className="text-white/50 text-sm text-center py-6">Be the first to leave a comment!</p>
                      ) : (
                        (comments[sortedFiles[currentImageIndex].id] ?? []).map((c) => (
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
                              handleAddComment(sortedFiles[currentImageIndex].id);
                            }
                          }}
                          rows={2}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-sm resize-none focus-visible:ring-white/30 flex-1"
                        />
                        <button
                          onClick={() => handleAddComment(sortedFiles[currentImageIndex].id)}
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

export default Gallery;
