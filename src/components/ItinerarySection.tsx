import React from "react";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

interface EventProps {
  time: string;
  title: string;
  location: string;
  venue: string;
  description: string;
}

const Event = ({ time, title, location, venue, description }: EventProps) => {
  return (
    <div className="relative flex items-start mb-8 last:mb-0">
      {/* Timeline dot */}
      <div className="flex-shrink-0 w-4 h-4 bg-black rounded-full mt-2 mr-6 relative z-10" />
      {/* Event content */}
      <div className="flex-1 bg-gray-50 p-6 rounded-lg">
        <div className="flex items-center gap-2 text-gray-500 mb-2">
          <Clock size={16} />
          <span className="text-sm font-medium">{time}</span>
        </div>

        <h3
          className="font-heading font-semibold mb-2"
          style={{ fontSize: "2rem" }}
        >
          {title}
        </h3>

        <div className="flex items-center gap-2 text-gray-600 mb-1">
          <MapPin size={16} />
          <span className="font-medium">{location}</span>
        </div>

        <div className="text-gray-500 text-sm mb-3">{venue}</div>

        <p className="text-gray-700 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

interface ItinerarySectionProps {
  ceremonyEvents?: EventProps[];
  receptionEvents?: EventProps[];
  defaultTab?: "ceremony" | "reception";
  showOnlyReception?: boolean;
  showOnlyCeremony?: boolean;
}

const ItinerarySection = ({
  ceremonyEvents = defaultCeremonyEvents,
  receptionEvents = defaultReceptionEvents,
  defaultTab = "ceremony",
  showOnlyReception = false,
  showOnlyCeremony = false,
}: ItinerarySectionProps) => {
  return (
    <section className="px-4 bg-white h-fit w-full" id="itinerary" style={{ paddingTop: '7em', paddingBottom: '7em' }}>
      <div className="max-w-3xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-3 font-medium text-5xl">Wedding Itinerary</h2>
          <p className="text-gray-600 max-w-lg mx-auto">
            Join us for a day of celebration. Here's what to expect on our
            special day.
          </p>
          <Separator className="mt-6 max-w-[100px] mx-auto bg-gray-300" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {showOnlyReception ? (
            <div className="relative pt-[50px]">
              {/* Timeline line */}
              <div className="absolute left-2 top-8 bottom-8 w-0.5 bg-gray-300" />

              <div className="space-y-0">
                {receptionEvents.map((event, index) => (
                  <Event
                    key={index}
                    time={event.time}
                    title={event.title}
                    location={event.location}
                    venue={event.venue}
                    description={event.description}
                  />
                ))}
              </div>
            </div>
          ) : showOnlyCeremony ? (
            <div className="relative pt-[50px]">
              {/* Timeline line */}
              <div className="absolute left-2 top-8 bottom-8 w-0.5 bg-gray-300" />

              <div className="space-y-0">
                {ceremonyEvents.map((event, index) => (
                  <Event
                    key={index}
                    time={event.time}
                    title={event.title}
                    location={event.location}
                    venue={event.venue}
                    description={event.description}
                  />
                ))}
              </div>
            </div>
          ) : (
            <Tabs defaultValue={defaultTab} className="w-full pt-[50px]">
              <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md mx-auto">
                <TabsTrigger value="ceremony">Ceremony</TabsTrigger>
                <TabsTrigger value="reception">Reception</TabsTrigger>
              </TabsList>

              <TabsContent value="ceremony">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-2 top-8 bottom-8 w-0.5 bg-gray-300" />

                  <div className="space-y-0">
                    {ceremonyEvents.map((event, index) => (
                      <Event
                        key={index}
                        time={event.time}
                        title={event.title}
                        location={event.location}
                        venue={event.venue}
                        description={event.description}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reception">
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-2 top-8 bottom-8 w-0.5 bg-gray-300" />

                  <div className="space-y-0">
                    {receptionEvents.map((event, index) => (
                      <Event
                        key={index}
                        time={event.time}
                        title={event.title}
                        location={event.location}
                        venue={event.venue}
                        description={event.description}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>
    </section>
  );
};

const defaultCeremonyEvents: EventProps[] = [
  {
    time: "2:00 PM",
    title: "Ceremony",
    location: "St. Mary's Church",
    venue: "123 Church Street, Downtown",
    description:
      "The wedding ceremony will take place in the beautiful St. Mary's Church. Please arrive 15 minutes early to be seated before the bride arrives.",
  },
  {
    time: "3:30 PM",
    title: "Cocktail Hour",
    location: "Garden Terrace",
    venue: "Riverside Manor, 456 Garden Way",
    description:
      "Following the ceremony, join us for drinks and hors d'oeuvres on the Garden Terrace while we take photos with family.",
  },
];

const defaultReceptionEvents: EventProps[] = [
  {
    time: "5:00 PM",
    title: "Reception",
    location: "Grand Ballroom",
    venue: "Riverside Manor, 456 Garden Way",
    description:
      "Dinner will be served in the Grand Ballroom. The evening will include toasts, dinner, cake cutting, and dancing.",
  },
  {
    time: "10:00 PM",
    title: "After Party",
    location: "Skyline Lounge",
    venue: "Riverside Manor, Rooftop Level",
    description:
      "For those who wish to continue celebrating, we'll be moving to the Skyline Lounge for drinks and dancing until late.",
  },
];

export default ItinerarySection;
