import React from "react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  coupleName?: string;
  weddingDate?: string;
  venue?: string;
  backgroundImage?: string;
}

const HeroSection = ({
  coupleName = "Jamie & Alexandra",
  weddingDate = "April 02, 2026",
  venue = "The Registry Office, Douglas",
  backgroundImage = "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
}: HeroSectionProps) => {
  return (
    <section className="relative w-full flex items-center justify-center bg-black text-white overflow-hidden py-[7.5rem]">
      {/* Background Image with Black and White Filter */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(100%) brightness(0.5)",
        }}
      />
      {/* Content Container */}
      <motion.div
        className="relative z-10 text-center px-4 max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Decorative Element */}
        <motion.div
          className="mx-auto mb-8 w-24 h-px bg-white"
          initial={{ width: 0 }}
          animate={{ width: 96 }}
          transition={{ delay: 0.5, duration: 1 }}
        />

        {/* Couple Names */}
        <motion.h1
          className="font-heading text-7xl md:text-9xl mb-6 tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 1 }}
        >
          {coupleName}
        </motion.h1>

        {/* Invitation Text */}
        <motion.p
          className="text-xl md:text-2xl font-light tracking-widest opacity-90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
        >
          Invite you to celebrate their wedding!
        </motion.p>

        {/* Decorative Element */}
        <motion.div
          className="mx-auto mt-8 w-24 h-px bg-white"
          initial={{ width: 0 }}
          animate={{ width: 96 }}
          transition={{ delay: 1.3, duration: 1 }}
        />
      </motion.div>
    </section>
  );
};

export default HeroSection;
