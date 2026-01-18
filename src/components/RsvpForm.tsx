import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  guestsInvited: z.string().min(1, { message: "Please select number of guests invited." }),
  guest1Name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  guest1Attending: z.string().min(1, { message: "Please select attendance status." }),
  guest2Name: z.string().optional(),
  guest2Attending: z.string().optional(),
  guest3Name: z.string().optional(),
  guest3Attending: z.string().optional(),
  guest4Name: z.string().optional(),
  guest4Attending: z.string().optional(),
  dietaryRequirements: z.string().optional(),
  songRequests: z.string().optional(),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const RsvpForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [guestsInvited, setGuestsInvited] = useState<number>(1);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      guestsInvited: "1",
      guest1Name: "",
      guest1Attending: "",
      guest2Name: "",
      guest2Attending: "",
      guest3Name: "",
      guest3Attending: "",
      guest4Name: "",
      guest4Attending: "",
      dietaryRequirements: "",
      songRequests: "",
      message: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Prepare email content
      const guestList = [];
      if (data.guest1Name) {
        guestList.push(`Guest 1: ${data.guest1Name} - ${data.guest1Attending === 'yes' ? 'Attending' : 'Not Attending'}`);
      }
      if (data.guest2Name && parseInt(data.guestsInvited) >= 2) {
        guestList.push(`Guest 2: ${data.guest2Name} - ${data.guest2Attending === 'yes' ? 'Attending' : 'Not Attending'}`);
      }
      if (data.guest3Name && parseInt(data.guestsInvited) >= 3) {
        guestList.push(`Guest 3: ${data.guest3Name} - ${data.guest3Attending === 'yes' ? 'Attending' : 'Not Attending'}`);
      }
      if (data.guest4Name && parseInt(data.guestsInvited) >= 4) {
        guestList.push(`Guest 4: ${data.guest4Name} - ${data.guest4Attending === 'yes' ? 'Attending' : 'Not Attending'}`);
      }

      const emailContent = `
Wedding RSVP Submission

Number of Guests Invited: ${data.guestsInvited}

Guest Details:
${guestList.join('\n')}

Contact Email: ${data.email}

Dietary Requirements: ${data.dietaryRequirements || 'None'}

Song Requests: ${data.songRequests || 'None'}

Additional Message: ${data.message || 'None'}
      `.trim();

      // Send email using Web3Forms
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: import.meta.env.VITE_RSVPAPIKey,
          subject: 'New Wedding RSVP Submission',
          from_name: data.guest1Name,
          email: data.email,
          to_email: 'theclaguewedding@outlook.com',
          message: emailContent,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log("Form submitted successfully:", data);
        setIsSubmitted(true);
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting your RSVP. Please try again or contact us directly.");
    }
  };

  if (isSubmitted) {
    return (
      <section
        className="px-4 bg-gray-50"
        id="rsvp"
        style={{ paddingTop: "7em", paddingBottom: "7em" }}
      >
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-heading">Thank You!</CardTitle>
            <CardDescription>Your RSVP has been received</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-center text-gray-600">
              We're excited to celebrate with you! You'll receive a confirmation
              email shortly.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section
      className="px-4 bg-gray-50 h-fit"
      id="rsvp"
      style={{ paddingTop: "7em", paddingBottom: "7em" }}
    >
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl font-heading text-center mb-2">RSVP</h2>
        <p className="text-center text-gray-600 mb-8">
          Please respond by 23rd February 2026
        </p>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-heading">
              Will you be joining us?
            </CardTitle>
            <CardDescription>
              Fill out the form below to let us know if you can make it to our
              special days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="guestsInvited"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Guests Invited</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setGuestsInvited(parseInt(value));
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of guests invited" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {guestsInvited >= 1 && (
                  <div className="flex gap-4 items-start">
                    <FormField
                      control={form.control}
                      name="guest1Name"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel>Guest 1 - Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="guest1Attending"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel>Attending</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {guestsInvited >= 2 && (
                  <div className="flex gap-4 items-start">
                    <FormField
                      control={form.control}
                      name="guest2Name"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel>Guest 2 - Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="guest2Attending"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel>Attending</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {guestsInvited >= 3 && (
                  <div className="flex gap-4 items-start">
                    <FormField
                      control={form.control}
                      name="guest3Name"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel>Guest 3 - Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="guest3Attending"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel>Attending</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {guestsInvited >= 4 && (
                  <div className="flex gap-4 items-start">
                    <FormField
                      control={form.control}
                      name="guest4Name"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel>Guest 4 - Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="guest4Attending"
                      render={({ field }) => (
                        <FormItem className="w-1/2">
                          <FormLabel>Attending</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dietaryRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dietary Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please let us know if you have any dietary restrictions or allergies."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="songRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Song Requests</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any songs you'd like to hear at the reception?"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message for the Couple</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Optional message for the bride and groom"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <CardFooter className="px-0 pt-4">
                  <Button type="submit" className="w-full">
                    Submit RSVP
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
};

export default RsvpForm;
