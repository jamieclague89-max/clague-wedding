import React, { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface PartyMember {
  name: string;
  image: string;
  tagline: string;
  role?: string;
}

interface WeddingPartySectionProps {
  bridesmaids?: PartyMember[];
  groomsmen?: PartyMember[];
  defaultTab?: "bridesmaids" | "groomsmen";
  showOnlyGroomsmen?: boolean;
  showOnlyBridesmaids?: boolean;
}

const defaultBridesmaids: PartyMember[] = [
  {
    name: "Emma Tracey",
    image: "/images/Emma Tracey.png",
    tagline: "Most likely to make everyone laugh",
    role: "Maid of Honour",
  },
  {
    name: "Sarah Boyd",
    image: "/images/Sarah Boyd.png",
    tagline: "Most likely to make everyone laugh",
    role: "Maid of Honour",
  },
  {
    name: "Laura Holiday",
    image: "/images/Laura Holiday.png?v=2",
    tagline: "Most likely to make everyone laugh",
  },
  {
    name: "Emma Fulton",
    image: "/images/Emma Fulton.png",
    tagline: "Most likely to plan the perfect party",
  },
  {
    name: "Lauren Burns",
    image: "/images/Lauren Burns.png",
    tagline: "Most likely to give the best advice",
  },
  {
    name: "Carlene Hallsall",
    image: "/images/Carlene Halsall.png",
    tagline: "Most likely to be the life of the party",
  },
  {
    name: "Ellie Callow",
    image: "/images/Ellie Callow.png",
    tagline: "Most likely to start a dance party",
  },
  {
    name: "Alexis Callow",
    image: "/images/Lexi Callow.png",
    tagline: "Most likely to keep everyone organized",
  },
  {
    name: "Emma Callow",
    image: "/images/Emma Callow.png",
    tagline: "Most likely to have the best stories",
  },
  {
    name: "Jasmine Johnstone",
    image: "/images/Jasmine Johnstone.png",
    tagline: "Most likely to bring the energy",
  },
];

const defaultGroomsmen: PartyMember[] = [
  {
    name: "William Penhallurick",
    image: "/images/William Penhallurick.png",
    tagline: "Most likely to tell dad jokes",
    role: "Best Man",
  },
  {
    name: "Stephen Lovelady-Wakenshaw",
    image: "/images/Stephen Lovelady Wakenshaw.png",
    tagline: "Most likely to tell dad jokes",
  },
  {
    name: "Oliver Bennett",
    image: "/images/Oliver Bennett.png?v=2",
    tagline: "Most likely to be the designated driver",
  },
  {
    name: "Darren Shields",
    image: "/images/Darren Shields.png?v=2",
    tagline: "Most likely to start a dance battle",
  },
  {
    name: "Daniel Pennington",
    image: "/images/Daniel Pennington.png",
    tagline: "Most likely to give the best toast",
  },
  {
    name: "Lee Shields",
    image: "/images/Lee Shields.png?v=2",
    tagline: "Most likely to keep everyone entertained",
  },
];

const PartyMemberCard = ({
  member,
  isCenter,
  role,
}: {
  member: PartyMember;
  isCenter: boolean;
  role: string;
}) => {
  return (
    <Card
      className={`border-0 bg-transparent shadow-none transition-all duration-500 ${
        isCenter ? "scale-165 opacity-100" : "scale-90 opacity-40 blur-lg"
      }`}
    >
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="rounded-full overflow-hidden mb-4 w-[298px] h-[298px]">
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        </div>
        <h3 className="mb-2 font-medium text-3xl">{member.name}</h3>
        <p className="text-sm text-gray-500 mb-2 font-black">
          {member.role || role}
        </p>
        <p className="text-gray-600 italic">{member.tagline}</p>
      </CardContent>
    </Card>
  );
};

const WeddingPartySection = ({
  bridesmaids = defaultBridesmaids,
  groomsmen = defaultGroomsmen,
  defaultTab = "bridesmaids",
  showOnlyGroomsmen = false,
  showOnlyBridesmaids = false,
}: WeddingPartySectionProps) => {
  const [bridesmaidsApi, setBridesmaidsApi] = useState<CarouselApi>();
  const [groomsmenApi, setGroomsmenApi] = useState<CarouselApi>();
  const [bridesmaidsCenter, setBridesmaidsCenter] = useState(0);
  const [groomsmenCenter, setGroomsmenCenter] = useState(0);

  useEffect(() => {
    if (!bridesmaidsApi) return;

    const updateCenter = () => {
      const selected = bridesmaidsApi.selectedScrollSnap();
      setBridesmaidsCenter(selected);
    };

    bridesmaidsApi.on("select", updateCenter);
    updateCenter();

    return () => {
      bridesmaidsApi.off("select", updateCenter);
    };
  }, [bridesmaidsApi]);

  useEffect(() => {
    if (!groomsmenApi) return;

    const updateCenter = () => {
      const selected = groomsmenApi.selectedScrollSnap();
      setGroomsmenCenter(selected);
    };

    groomsmenApi.on("select", updateCenter);
    updateCenter();

    return () => {
      groomsmenApi.off("select", updateCenter);
    };
  }, [groomsmenApi]);

  return (
    <section
      className="px-4 bg-gray-50"
      id="wedding-party"
      style={{ paddingTop: '7em', paddingBottom: '7em' }}
    >
      <div className="max-w-6xl mx-auto pt-[0px]">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading mb-3 text-5xl">Wedding Party</h2>
          <p className="text-gray-600 max-w-lg mx-auto">
            Meet the special people standing by our side on our big day.
          </p>
          <Separator className="mt-6 max-w-[100px] mx-auto bg-gray-300" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {showOnlyGroomsmen ? (
            <div className="pt-[50px]">
              <Carousel
                setApi={setGroomsmenApi}
                opts={{
                  align: "center",
                  loop: true,
                }}
                className="w-full max-w-5xl mx-auto"
              >
                <CarouselContent>
                  {groomsmen.map((member, index) => (
                    <CarouselItem
                      key={index}
                      className="md:basis-1/2 lg:basis-1/3"
                    >
                      <div className="p-1">
                        <PartyMemberCard
                          member={member}
                          isCenter={index === groomsmenCenter}
                          role="Groomsman"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          ) : showOnlyBridesmaids ? (
            <div className="pt-[50px]">
              <Carousel
                setApi={setBridesmaidsApi}
                opts={{
                  align: "center",
                  loop: true,
                }}
                className="w-full max-w-5xl mx-auto"
              >
                <CarouselContent>
                  {bridesmaids.map((member, index) => (
                    <CarouselItem
                      key={index}
                      className="md:basis-1/2 lg:basis-1/3"
                    >
                      <div className="p-1">
                        <PartyMemberCard
                          member={member}
                          isCenter={index === bridesmaidsCenter}
                          role="Bridesmaid"
                          className=""
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          ) : (
            <Tabs defaultValue={defaultTab} className="w-full pt-[50px]">
              <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md mx-auto">
                <TabsTrigger value="bridesmaids">Bridesmaids</TabsTrigger>
                <TabsTrigger value="groomsmen">Groomsmen</TabsTrigger>
              </TabsList>

              <TabsContent value="bridesmaids">
                <Carousel
                  setApi={setBridesmaidsApi}
                  opts={{
                    align: "center",
                    loop: true,
                  }}
                  className="w-full max-w-5xl mx-auto"
                >
                  <CarouselContent>
                    {bridesmaids.map((member, index) => (
                      <CarouselItem
                        key={index}
                        className="md:basis-1/2 lg:basis-1/3"
                      >
                        <div className="p-1">
                          <PartyMemberCard
                            member={member}
                            isCenter={index === bridesmaidsCenter}
                            role="Bridesmaid"
                            className=""
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </TabsContent>

              <TabsContent value="groomsmen">
                <Carousel
                  setApi={setGroomsmenApi}
                  opts={{
                    align: "center",
                    loop: true,
                  }}
                  className="w-full max-w-5xl mx-auto"
                >
                  <CarouselContent>
                    {groomsmen.map((member, index) => (
                      <CarouselItem
                        key={index}
                        className="md:basis-1/2 lg:basis-1/3"
                      >
                        <div className="p-1">
                          <PartyMemberCard
                            member={member}
                            isCenter={index === groomsmenCenter}
                            role="Groomsman"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </TabsContent>
            </Tabs>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default WeddingPartySection;
