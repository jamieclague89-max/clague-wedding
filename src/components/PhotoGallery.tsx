import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion } from "framer-motion";

interface Photo {
  id: number;
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface PhotoGalleryProps {
  photos?: Photo[];
}

const PhotoGallery = ({ photos = defaultPhotos }: PhotoGalleryProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const openPhotoModal = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  const goToNextPhoto = () => {
    const nextIndex = (currentIndex + 1) % photos.length;
    setSelectedPhoto(photos[nextIndex]);
    setCurrentIndex(nextIndex);
  };

  const goToPrevPhoto = () => {
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    setSelectedPhoto(photos[prevIndex]);
    setCurrentIndex(prevIndex);
  };

  return (
    <section id="gallery" className="px-4 bg-white h-[953px]" style={{ paddingTop: '7em', paddingBottom: '7em' }}>
      <div className="mx-auto max-w-4xl">
        <motion.h2
          className="text-4xl text-center mb-12 font-medium md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Gallery
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-[0px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className="relative overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] aspect-square"
              onClick={() => openPhotoModal(photo, index)}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </motion.div>
      </div>
      <Dialog open={!!selectedPhoto} onOpenChange={() => closePhotoModal()}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {selectedPhoto && (
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.alt}
                className="max-h-[80vh] max-w-full object-contain"
              />
            )}

            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-black/50"
              onClick={closePhotoModal}
            >
              <X className="h-6 w-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/50"
              onClick={goToPrevPhoto}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/50"
              onClick={goToNextPhoto}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

// Default photos as placeholders
const defaultPhotos: Photo[] = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=800&q=80",
    alt: "Couple walking on beach",
    width: 800,
    height: 600,
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80",
    alt: "Couple holding hands",
    width: 800,
    height: 600,
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
    alt: "Couple at sunset",
    width: 800,
    height: 600,
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    alt: "Couple laughing together",
    width: 800,
    height: 600,
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80",
    alt: "Couple dancing",
    width: 800,
    height: 600,
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1511405889574-b01de1da5441?w=800&q=80",
    alt: "Couple at picnic",
    width: 800,
    height: 600,
  },
];

export default PhotoGallery;
