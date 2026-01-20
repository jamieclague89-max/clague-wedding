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
    <section
      className="px-4 bg-white h-fit w-full"
      id="itinerary"
      style={{ paddingTop: "7em", paddingBottom: "7em" }}
    >
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
            {showOnlyCeremony || showOnlyReception
              ? "Here's what to expect on our special day:"
              : "Here's what to expect on our special days:"}
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

              <div className="space-y-8">
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

              <div className="space-y-8">
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

                  <div className="space-y-8">
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

                  <div className="space-y-8">
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
    time: "15:00 - 15:15",
    title: "Guests Arrive",
    location: "Douglas Registry Office",
    venue:
      "Registries Building, Deemsters Walk, Bucks Road, Douglas, Isle of Man, IM1 3AR",
    description:
      "All guests are to arrive and be seated between 15:00 - 15:15.",
  },
  {
    time: "15:30",
    title: "Ceremony To Begin",
    location: "Douglas Registry Office",
    venue: "",
    description:
      "Our intimate wedding ceremony will commence with our close family and friends.",
  },
  {
    time: "16:00 - 16:30",
    title: "Wedding Photos",
    location: "Douglas Registry Office",
    venue: "",
    description:
      "Following the ceremony, there will be the opportunity for professional photographs with the bride and groom and all guests.",
  },
  {
    time: "16:30",
    title: "Celebratory Drinks",
    location: "The Prospect",
    venue: "Prospect Hill, Douglas",
    description:
      "Following the ceremony, guests are invited to join the newlyweds for celebratory drinks at The Prospect.",
  },
  {
    time: "17:00 - 18:00",
    title: "Transport To Looky's Lounge Bar",
    location: "The Prospect",
    venue: "",
    description:
      "Transport will depart from The Prospect, providing a direct connection to the evening celebrations at Looky’s Lounge Bar.",
  },
  {
    time: "18:00",
    title: "Evening Meal",
    location: "Looky's Lounge Bar",
    venue:
      "Best Western Palace Hotel, Looky's Lounge Bar, Central Promenade, Douglas IM2 4NA",
    description:
      "Join us at Looky's Lounge Bar for an evening of delicious food, drinks, and celebrations.",
  },
];

const defaultReceptionEvents: EventProps[] = [
  {
    time: "15:15",
    title: "Guest Arrive",
    location: "The Gallery, Villa Marina",
    venue: "Harris Promenade, Douglas, Isle of Man, IM1 2HP",
    description:
      "Guests are invited to arrive at the Villa Marina for 15:15, where welcome drinks will be provided in The Gallery.",
  },
  {
    time: "16:00",
    title: "Guests To Be Seated",
    location: "Colonnade Suite, Villa Marina",
    venue: "",
    description:
      "Guests will be invited to take their seats in the Colonnade Suite for the arrival of the wedding party.",
  },
  {
    time: "16:15",
    title: "Reception To Begin",
    location: "Colonnade Suite, Villa Marina",
    venue: "",
    description:
      "The wedding party will arrive, followed by the opening speeches.",
  },
  {
    time: "17:30",
    title: "Food To Be Served",
    location: "Colonnade Suite, Villa Marina",
    venue: "",
    description:
      "A hot buffet with a generous selection of dishes will be available for everyone to enjoy.",
  },
  {
    time: "18:30 - 21:00",
    title: "Entertainment",
    location: "Colonnade Suite, Villa Marina",
    venue: "",
    description: "Entertainment will be provided to celebrate the newlyweds.",
  },
  {
    time: "21:00 - 21:30",
    title: "Evening Food To Be Served",
    location: "Colonnade Suite, Villa Marina",
    venue: "",
    description:
      "A selection of hot food will be provided for all guests to enjoy.",
  },
  {
    time: "21:30 - 00:30",
    title: "Entertainment",
    location: "Colonnade Suite, Villa Marina",
    venue: "",
    description:
      "Entertainment will again be provided before bringing the evening to a close at 00:30.",
  },
];

export default ItinerarySection;
