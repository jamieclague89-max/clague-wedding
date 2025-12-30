import React from "react";
import HeroSection from "./HeroSection";
import CoupleStorySection from "./CoupleStorySection";
import ItinerarySection from "./ItinerarySection";
import PhotoGallery from "./PhotoGallery";
import RsvpForm from "./RsvpForm";
import VenueSection from "./VenueSection";
import WeddingPartySection from "./WeddingPartySection";
import OtherInfoSection from "./OtherInfoSection";
import GiftingSection from "./GiftingSection";
import CoupleInfoSection from "./CoupleInfoSection";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";

const Ceremony = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="bg-white text-black">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <img src="/images/J-A Wedding Logo.png" alt="J & A Wedding Logo" className="h-[70px] w-auto object-contain" />

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-8">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-sm hover:text-gray-600 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("our-story")}
              className="text-sm hover:text-gray-600 transition-colors"
            >
              Our Story
            </button>
            <button
              onClick={() => scrollToSection("venue")}
              className="text-sm hover:text-gray-600 transition-colors"
            >
              Venue
            </button>
            <button
              onClick={() => scrollToSection("itinerary")}
              className="text-sm hover:text-gray-600 transition-colors"
            >
              Itinerary
            </button>
            <button
              onClick={() => scrollToSection("wedding-party")}
              className="text-sm hover:text-gray-600 transition-colors"
            >
              Wedding Party
            </button>
            <button
              onClick={() => scrollToSection("other-info")}
              className="text-sm hover:text-gray-600 transition-colors"
            >
              Other Info
            </button>
            <button
              onClick={() => scrollToSection("gifting")}
              className="text-sm hover:text-gray-600 transition-colors"
            >
              Gifting
            </button>
            <button
              onClick={() => scrollToSection("gallery")}
              className="text-sm hover:text-gray-600 transition-colors"
            >
              Gallery
            </button>
            <button
              onClick={() => scrollToSection("rsvp")}
              className="text-sm hover:text-gray-600 transition-colors"
            >
              RSVP
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4">
            <div className="container mx-auto px-4 flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection("hero")}
                className="text-sm py-2 hover:text-gray-600 transition-colors text-left"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("our-story")}
                className="text-sm py-2 hover:text-gray-600 transition-colors text-left"
              >
                Our Story
              </button>
              <button
                onClick={() => scrollToSection("venue")}
                className="text-sm py-2 hover:text-gray-600 transition-colors text-left"
              >
                Venue
              </button>
              <button
                onClick={() => scrollToSection("itinerary")}
                className="text-sm py-2 hover:text-gray-600 transition-colors text-left"
              >
                Itinerary
              </button>
              <button
                onClick={() => scrollToSection("wedding-party")}
                className="text-sm py-2 hover:text-gray-600 transition-colors text-left"
              >
                Wedding Party
              </button>
              <button
                onClick={() => scrollToSection("other-info")}
                className="text-sm py-2 hover:text-gray-600 transition-colors text-left"
              >
                Other Info
              </button>
              <button
                onClick={() => scrollToSection("gifting")}
                className="text-sm py-2 hover:text-gray-600 transition-colors text-left"
              >
                Gifting
              </button>
              <button
                onClick={() => scrollToSection("gallery")}
                className="text-sm py-2 hover:text-gray-600 transition-colors text-left"
              >
                Gallery
              </button>
              <button
                onClick={() => scrollToSection("rsvp")}
                className="text-sm py-2 hover:text-gray-600 transition-colors text-left"
              >
                RSVP
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main className="pt-16">
        {" "}
        {/* Add padding to account for fixed navbar */}
        {/* Hero Section */}
        <section id="hero" className="min-h-[calc(100vh-4rem)]">
          <HeroSection />
        </section>
        {/* Our Story Section */}
        <CoupleStorySection />
        {/* Venue Section - Ceremony Only */}
        <VenueSection showOnlyCeremony={true} />
        {/* Itinerary Section - Ceremony Only */}
        <ItinerarySection showOnlyCeremony={true} />
        {/* Wedding Party Section - Bridesmaids Only */}
        <WeddingPartySection showOnlyBridesmaids={true} />
        {/* Other Info Section */}
        <OtherInfoSection />
        {/* Gifting Section */}
        <GiftingSection />
        {/* Photo Gallery Section */}
        <PhotoGallery />
        {/* RSVP Section */}
        <RsvpForm />
      </main>

      {/* Footer */}
      <footer className="bg-black text-white" style={{ paddingTop: '7em', paddingBottom: '7em' }}>
        <div className="container mx-auto px-4 text-center">
          <p className="font-heading text-2xl mb-4">Jamie & Alexandra</p>
          <p className="text-sm text-gray-400">
            We can't wait to celebrate with you!
          </p>
          <p className="text-xs text-gray-500 mt-6">
            &copy; {new Date().getFullYear()} • Wedding Website
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Ceremony;
