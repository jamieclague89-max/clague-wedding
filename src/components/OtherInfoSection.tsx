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

interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
  {
    question: "What time should I arrive?",
    answer:
      "We recommend arriving at least 15-20 minutes before the ceremony start time to allow for parking and finding your seat.",
  },
  {
    question: "Is there parking available at the venue?",
    answer:
      "Yes, there is ample parking available at both the ceremony and reception venues. Parking is complimentary for all guests.",
  },
  {
    question: "Will there be transportation between venues?",
    answer:
      "Yes, we will provide shuttle transportation between the ceremony and reception venues for all guests who need it.",
  },
  {
    question: "Can I bring a plus one?",
    answer:
      "Due to limited capacity, we can only accommodate those guests named on the invitation. Please refer to your invitation for details.",
  },
  {
    question: "What if I have dietary restrictions?",
    answer:
      "Please let us know about any dietary restrictions when you RSVP. We will do our best to accommodate all dietary needs.",
  },
  {
    question: "Is the venue wheelchair accessible?",
    answer:
      "Yes, both the ceremony and reception venues are fully wheelchair accessible. Please contact us if you have any specific accessibility needs.",
  },
];

const infoItems: InfoItem[] = [
  {
    title: "Attire",
    icon: <Shirt className="h-6 w-6" />,
    content:
      "We kindly request formal attire for our wedding. Ladies, please wear cocktail dresses or formal gowns. Gentlemen, suits or tuxedos are preferred. The ceremony will be outdoors, so please plan accordingly.",
  },
  {
    title: "Photos",
    icon: <Camera className="h-6 w-6" />,
    content:
      "We have hired a professional photographer to capture our special day. We kindly ask that you enjoy the moment unplugged during the ceremony. Feel free to take photos during the reception and share them with us using #OurWeddingDay.",
  },
  {
    title: "Invite Only",
    icon: <UserCheck className="h-6 w-6" />,
    content:
      "Our wedding is an intimate celebration with limited capacity. We have reserved seats specifically for those named on your invitation. We appreciate your understanding and look forward to celebrating with you.",
  },
  {
    title: "Children",
    icon: <Baby className="h-6 w-6" />,
    content:
      "While we love your little ones, we have decided to make our wedding an adults-only celebration. We hope this gives you the opportunity to relax and enjoy the evening. Thank you for understanding.",
  },
];

interface OtherInfoSectionProps {
  className?: string;
}

export const OtherInfoSection = ({ className = "" }: OtherInfoSectionProps) => {
  return (
    <div id="other-info" className={`bg-white h-fit ${className}`} style={{ paddingTop: '7em', paddingBottom: '7em' }}>
      <motion.div
        className="text-center mb-12 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-heading mb-3 text-5xl">Other Info</h2>
        <p className="text-gray-600 max-w-lg mx-auto">
          A few important details to help you prepare for our special day.
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
      {/* FAQ Section */}
      <motion.div
        className="mt-16 mx-auto max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h3 className="text-3xl font-medium text-center mb-8">
          Frequently Asked Questions
        </h3>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  );
};

export default OtherInfoSection;
