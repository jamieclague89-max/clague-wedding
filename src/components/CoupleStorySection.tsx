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
  ourStoryText = "In spring 2017 it all started with a swipe to the right. Two people on different journey's, spent time together, made memories and had lots of laughs. Two years later we decided to commit to each other and haven't looked back since. Jamie created romantic dates, adopted Fininzie the cat and had many chinese's at Alex's. Wilst Alex learnt quickly that most nights consisted of the Premier League, the weekends DAFC and Loong Tan. We have survived a renovation, brought up April and are now on our journey to tie the knot!",
  proposalTitle = "The Proposal",
  proposalText = "On Christmas morning 2024, Jamie planted a surprise box at the back of the tree. After presents were exchanged, Jamie told Alex there was a special gift at the back of the tree at the top, she found it and opened her perfume. Jamie then advised there was one more surprise at the bottom of the tree, Alex rumaged around as she couldn't find it. Finally, she found it, turned around and there was Jamie down on one knee with the shiniest diamond ring.",
}: CoupleStorySectionProps) => {
  return (
    <section id="our-story" className="py-20 bg-white pt-7">
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
          <p className="text-gray-700 leading-relaxed text-lg my-[16px]">
            {ourStoryText}
          </p>
        </motion.div>

        {/* The Proposal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className=" mb-[0px] pb-[0px] pt-[83px]"
        >
          <h3 className="text-center mb-6 text-5xl">{proposalTitle}</h3>
          <p className="text-gray-700 leading-relaxed text-lg">
            {proposalText}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CoupleStorySection;
