import React from "react";
import { MapPin, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

interface VenueInfo {
  name: string;
  address: string;
  description: string;
  time?: string;
  date?: string;
}

interface VenueSectionProps {
  ceremonyVenue?: VenueInfo;
  receptionVenue?: VenueInfo;
  lookysBarVenue?: VenueInfo;
  defaultTab?: "ceremony" | "reception";
  showOnlyReception?: boolean;
  showOnlyCeremony?: boolean;
}

const VenueCard = ({
  venue,
  title,
  number,
}: {
  venue: VenueInfo;
  title: string;
  number?: number;
}) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2 text-[32px]">
          {number && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-black text-lg font-bold flex-shrink-0">
              {number}
            </div>
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="font-body font-semibold text-lg mb-2">
            {venue.name}
          </div>
          <p className="text-gray-600 flex items-start gap-2 text-base">
            <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
            {venue.address}
          </p>
          {venue.date && (
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 flex-shrink-0" />
              {venue.date}
            </p>
          )}
          {venue.time && (
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4 flex-shrink-0" />
              {venue.time}
            </p>
          )}
        </div>

        {venue.description && (
          <p className="text-gray-700 leading-relaxed text-base">
            {venue.description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const VenueSection = ({
  ceremonyVenue = defaultCeremonyVenue,
  receptionVenue = defaultReceptionVenue,
  lookysBarVenue = defaultLookysBarVenue,
  defaultTab = "ceremony",
  showOnlyReception = false,
  showOnlyCeremony = false,
}: VenueSectionProps) => {
  return (
    <div>
      <section
        className="px-4 bg-gray-50"
        id="venue"
        style={{ paddingTop: "7em", paddingBottom: "7em" }}
      >
        <div className="mx-auto max-w-4xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-heading mb-3 text-5xl">Wedding Information</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {showOnlyCeremony 
                ? "Join us at these beautiful locations for our special day. Below you'll find all the details about our ceremony venues."
                : showOnlyReception
                ? "Join us at this beautiful location for our special day. Below you'll find all the details about our reception venue."
                : "Join us at these beautiful locations for our special days. Below you'll find all the details about our ceremony and reception venues."}
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
              <div className="max-w-2xl mx-auto pt-[50px]">
                <VenueCard venue={receptionVenue} title="Wedding Reception" />
              </div>
            ) : showOnlyCeremony ? (
              <div className="grid md:grid-cols-2 gap-8 pt-[50px]">
                <VenueCard
                  venue={ceremonyVenue}
                  title="Wedding Ceremony"
                  number={1}
                />
                <VenueCard
                  venue={lookysBarVenue}
                  title="Evening Celebrations"
                  number={2}
                />
              </div>
            ) : (
              <Tabs defaultValue={defaultTab} className="w-full pt-[50px]">
                <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md mx-auto">
                  <TabsTrigger value="ceremony">Ceremony</TabsTrigger>
                  <TabsTrigger value="reception">Reception</TabsTrigger>
                </TabsList>

                <TabsContent value="ceremony" className=" mt-[41.5px]">
                  <div className="grid md:grid-cols-2 gap-8">
                    <VenueCard
                      venue={ceremonyVenue}
                      title="Wedding Ceremony"
                      number={1}
                    />
                    <VenueCard
                      venue={lookysBarVenue}
                      title="Evening Celebrations"
                      number={2}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="reception">
                  <div className="max-w-2xl mx-auto">
                    <VenueCard
                      venue={receptionVenue}
                      title="Wedding Reception"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </motion.div>

          <motion.div
            className="text-center mt-[80px]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-gray-50 p-6 rounded-lg max-w-3xl mx-auto">
              <Clock className="h-6 w-6 mx-auto mb-3 text-gray-600" />
              <h3 className="mb-2 font-medium text-3xl">
                Important Information
              </h3>
              <p className="text-gray-600 text-lg">
                Transportation will be provided between venues for all guests.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const defaultCeremonyVenue: VenueInfo = {
  name: "Douglas Registry Office",
  address:
    "Registries Building, Deemsters Walk, Bucks Road, Douglas, Isle of Man, IM1 3AR",
  date: "Thursday 2nd April 2026",
  time: "15:00 - 15:15",
  description:
    "Please join us for an intimate wedding ceremony with our close family and friends.",
};

const defaultReceptionVenue: VenueInfo = {
  name: "Villa Marina, Colonnade Suite",
  address: "Harris Promenade, Douglas, Isle of Man, IM1 2HP",
  date: "Saturday 4th April 2026",
  time: "15:15",
  description:
    "We would love for you to join us, along with all our family and friends, for an afternoon and evening of celebrations.",
};

const defaultLookysBarVenue: VenueInfo = {
  name: "Looky's Lounge Bar",
  address:
    "Best Western Palace Hotel & Casino, Central Promenade, Douglas, Isle of Man, IM2 4NA",
  date: "Thursday 2nd April 2026",
  time: "18:00",
  description:
    "After the ceremony join us for an evening of celebrations with food and drinks at Looky's Lounge Bar.",
};

export default VenueSection;
