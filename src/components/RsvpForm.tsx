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
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  guests: z.string().min(1, { message: "Please select number of guests." }),
  attending: z
    .string()
    .min(1, { message: "Please select if you are attending." }),
  dietaryRequirements: z.string().optional(),
  message: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const RsvpForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      guests: "1",
      attending: "",
      dietaryRequirements: "",
      message: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    // In a real application, you would send this data to your backend
    console.log("Form submitted:", data);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <section className="px-4 bg-gray-50" id="rsvp" style={{ paddingTop: '7em', paddingBottom: '7em' }}>
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
    <section className="px-4 bg-gray-50 h-fit" id="rsvp" style={{ paddingTop: '7em', paddingBottom: '7em' }}>
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl font-heading text-center mb-2">RSVP</h2>
        <p className="text-center text-gray-600 mb-8">
          Please respond by June 1, 2024
        </p>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-heading">
              Will you be joining us?
            </CardTitle>
            <CardDescription>
              Fill out the form below to let us know if you can make it to our
              special day.
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
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                  name="attending"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Will you attend?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="yes">Joyfully Accept</SelectItem>
                          <SelectItem value="no">
                            Regretfully Decline
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Guests</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select number of guests" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1</SelectItem>
                          <SelectItem value="2">2</SelectItem>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="4">4</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Please include yourself in the guest count.
                      </FormDescription>
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
