import React from "react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Heart, Plane, Gift } from "lucide-react";

interface GiftingSectionProps {
  honeymoonFundUrl?: string;
}

export const GiftingSection = ({
  honeymoonFundUrl = "https://example.com/honeymoon-fund",
}: GiftingSectionProps) => {
  return (
    <section
      className="px-4 bg-gray-50 h-fit"
      id="gifting"
      style={{ paddingTop: '7em', paddingBottom: '7em' }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading mb-3 text-5xl">Gifting</h2>
          <p className="text-gray-600 max-w-lg mx-auto">
            Your presence at our wedding is the greatest gift of all.
          </p>
          <Separator className="mt-6 max-w-[100px] mx-auto bg-gray-300" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                {/* Image/Illustration Side */}
                <div className="bg-gray-100 p-8 flex items-center justify-center min-h-[300px]">
                  <div className="text-center">
                    <div className="flex justify-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Plane className="h-8 w-8 text-gray-600" />
                      </div>
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Heart className="h-8 w-8 text-gray-600" />
                      </div>
                      <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Gift className="h-8 w-8 text-gray-600" />
                      </div>
                    </div>
                    <p className="text-gray-500 italic text-lg">
                      Help us create memories
                    </p>
                  </div>
                </div>

                {/* Content Side */}
                <div className="p-8 flex flex-col justify-center">
                  <h3 className="text-3xl font-medium mb-4">Honeymoon Fund</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    As we begin our new life together, we would be incredibly
                    grateful for contributions towards our honeymoon adventure.
                    Your generosity will help us create unforgettable memories
                    as we celebrate our love.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-8">
                    If you wish to contribute, please click the button below to
                    visit our honeymoon fund page. Every contribution, no matter
                    the size, is deeply appreciated.
                  </p>
                  <Button
                    size="lg"
                    className="w-full md:w-auto"
                    onClick={() => window.open(honeymoonFundUrl, "_blank")}
                  >
                    <Gift className="mr-2 h-5 w-5" />
                    Contribute to Our Honeymoon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.p
          className="text-center text-gray-500 mt-8 text-base"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Your love and support mean the world to us. Thank you for being part
          of our special day.
        </motion.p>
      </div>
    </section>
  );
};

export default GiftingSection;
