import React from "react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Shirt, Camera, UserCheck, Baby } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface InfoItem {
  title: string;
  icon: React.ReactNode;
  content: string;
}

const infoItems: InfoItem[] = [
  {
    title: "Invite Only",
    icon: <UserCheck className="h-6 w-6" />,
    content:
      "Our wedding is a invite-only celebration. Due to limited room capacity, we kindly request that only those named on the invitation attend. We apprciate your understanding and can't wait to celebrate together.",
  },
  {
    title: "Photos",
    icon: <Camera className="h-6 w-6" />,
    content:
      "We'll have a professional photographer with us on both days. For the ceremony, we kindly request that cameras stay tucked away so everyone can be fully present. At the reception, please feel free to snap away and share your photos with us after the event.",
  },
  {
    title: "Children",
    icon: <Baby className="h-6 w-6" />,
    content:
      "While we love your little ones, we have decided to make our wedding an adults-only celebration. We hope this gives you the opportunity to relax and enjoy the evening. Thank you for understanding.",
  },
  {
    title: "Attire",
    icon: <Shirt className="h-6 w-6" />,
    content:
      "We'd love everyone to dress in smart attire - polished enough for photos, comfy enough to dance.",
  },
];

interface OtherInfoSectionProps {
  className?: string;
  showOnlyCeremony?: boolean;
  showOnlyReception?: boolean;
}

export const OtherInfoSection = ({ className = "", showOnlyCeremony, showOnlyReception }: OtherInfoSectionProps) => {
  return (
    <div
      id="other-info"
      className={`bg-white h-fit ${className}`}
      style={{ paddingTop: "7em", paddingBottom: "7em" }}
    >
      <motion.div
        className="text-center mb-12 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-heading mb-3 text-5xl">Other Info</h2>
        <p className="text-gray-600 max-w-lg mx-auto">
          {(showOnlyCeremony || showOnlyReception)
            ? "A few important details to help you prepare for our special day."
            : "A few important details to help you prepare for our special days."}
        </p>
        <Separator className="mt-6 max-w-[100px] mx-auto bg-gray-300" />
      </motion.div>
      <motion.div
        className="grid md:grid-cols-2 gap-6 pt-[50px] max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {infoItems.map((item, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-2 text-3xl">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.content}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
};

export default OtherInfoSection;
