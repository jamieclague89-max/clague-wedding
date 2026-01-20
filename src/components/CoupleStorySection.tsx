import React from "react";
import { motion } from "framer-motion";

interface CoupleStorySectionProps {
  welcomeText?: string;
  ourStoryTitle?: string;
  ourStoryText?: string;
  proposalTitle?: string;
  proposalText?: string;
}

const CoupleStorySection = ({
  welcomeText = "Welcome to our wedding website! We're so excited to share this special day with you. Here's a little bit about our journey together.",
  ourStoryTitle = "Our Story",
  ourStoryText = "Like many modern love stories, ours began with a swipe to the right in spring 2017. What started as casual conversations, quickly turned into long nights of talking – about everything and nothing – losing track of time and slowly realising how easy it felt to be ourselves together. Life moved at its own pace, and so did we. We took our time getting to know each other, those years allowed our connection to grow naturally, grounded in friendship, laughter, and trust. What began as late night conversations gradually became days spent together, moments that turned into memories, and ultimately, a life we built together. Now, we’re so excited to celebrate the next chapter of our story with all of you.",
  proposalTitle = "The Proposal",
  proposalText = "After nearly eight years together, Jamie proposed on Christmas Day 2024. Surrounded by the glow of our Christmas tree with April by our side, in our very own home that we built together. It was a quiet, heartfelt moment that was perfectly us.",
}: CoupleStorySectionProps) => {
  return (
    <section id="our-story" className="bg-white pt-[120px] pb-[120px]">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Welcome Text */}
        <motion.p
          className="text-center text-lg md:text-xl text-gray-700 leading-relaxed mb-[100px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {welcomeText}
        </motion.p>

        {/* Our Story */}
        <motion.div
          className="mb-16 mt-[0px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 className="text-center mb-6 text-7xl">{ourStoryTitle}</h3>
          <p className="text-gray-700 leading-relaxed text-lg my-[16px] text-center">
            {ourStoryText}
          </p>
        </motion.div>

        {/* The Proposal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-[83px]"
        >
          <h3 className="text-center mb-6 text-5xl">{proposalTitle}</h3>
          <p className="text-gray-700 leading-relaxed text-lg text-center">
            {proposalText}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CoupleStorySection;
