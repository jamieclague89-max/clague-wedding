import React from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

interface CoupleInfo {
  name: string;
  bio: string;
  hobbies: string[];
  favoriteMemory?: string;
}

interface CoupleInfoSectionProps {
  bride?: CoupleInfo;
  groom?: CoupleInfo;
  relationshipStory?: string;
}

const PersonCard = ({
  person,
  delay,
}: {
  person: CoupleInfo;
  delay: number;
}) => {
  return (
    <motion.div
      className="bg-white p-8 rounded-lg shadow-sm border border-gray-100"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
    >
      <h3 className="text-3xl font-heading mb-4 text-center">{person.name}</h3>
      <p className="text-gray-700 leading-relaxed mb-6">{person.bio}</p>

      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Hobbies & Interests</h4>
        <div className="flex flex-wrap gap-2">
          {person.hobbies.map((hobby, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
            >
              {hobby}
            </span>
          ))}
        </div>
      </div>

      {person.favoriteMemory && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">
            Favorite Memory Together
          </h4>
          <p className="text-gray-600 text-sm italic">
            &quot;{person.favoriteMemory}&quot;
          </p>
        </div>
      )}
    </motion.div>
  );
};

const CoupleInfoSection = ({
  bride = defaultBride,
  groom = defaultGroom,
  relationshipStory = defaultStory,
}: CoupleInfoSectionProps) => {
  return (
    <section className="px-4 bg-gray-50" style={{ paddingTop: '7em', paddingBottom: '7em' }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-heading mb-4">
            Meet the Couple
          </h2>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-px bg-gray-300" />
            <Heart className="h-5 w-5 text-gray-400" />
            <div className="w-12 h-px bg-gray-300" />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <PersonCard person={bride} delay={0.2} />
          <PersonCard person={groom} delay={0.4} />
        </div>

        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-2xl font-heading mb-4">Our Love Story</h3>
            <p className="text-gray-700 leading-relaxed">{relationshipStory}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const defaultBride: CoupleInfo = {
  name: "Jamie",
  bio: "Jamie is a passionate graphic designer who loves creating beautiful visual experiences. When she's not designing, you can find her exploring art galleries, trying new coffee shops, or planning her next adventure.",
  hobbies: ["Photography", "Yoga", "Cooking", "Travel", "Art", "Reading"],
  favoriteMemory:
    "Our first trip to Paris together, where Alexandra proposed at the Eiffel Tower at sunset.",
};

const defaultGroom: CoupleInfo = {
  name: "Alexandra",
  bio: "Alexandra is a software engineer with a love for problem-solving and innovation. She enjoys building things both digitally and with her hands, and has a passion for outdoor adventures and good music.",
  hobbies: [
    "Hiking",
    "Guitar",
    "Coding",
    "Woodworking",
    "Basketball",
    "Podcasts",
  ],
  favoriteMemory:
    "The weekend we spent building a treehouse together - it was when I knew Jamie was the one for me.",
};

const defaultStory =
  "Jamie and Alexandra first met at a mutual friend's birthday party in 2019. What started as a conversation about their shared love of travel quickly blossomed into something special. After three years of adventures, late-night conversations, and building a life together, Alexandra knew it was time to propose. Their journey has been filled with laughter, growth, and an unbreakable bond that continues to strengthen each day.";

export default CoupleInfoSection;
