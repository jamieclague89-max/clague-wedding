import React from "react";
import WeddingGalleryUpload from "@/components/WeddingGalleryUpload";
import BackToTop from "@/components/BackToTop";

const WeddingGallery = () => {
  React.useEffect(() => {
    document.title = "The Wedding Gallery | Jamie & Alex";
  }, []);

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Navigation - No links */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-center items-center">
          <img
            src="/images/J-A Wedding Logo.png"
            alt="J & A Wedding Logo"
            className="h-[70px] w-auto object-contain"
          />
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-[100px]">
        <WeddingGalleryUpload />
      </main>

      {/* Footer */}
      <footer
        className="bg-black text-white"
        style={{ paddingTop: "7em", paddingBottom: "7em" }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="font-heading text-2xl mb-4">Jamie & Alexandra</p>
          <p className="text-sm text-gray-400">
            Thank you for sharing your memories with us!
          </p>
          <p className="text-xs text-gray-500 mt-6">
            &copy; {new Date().getFullYear()} • Jamie & Alexandra's Wedding
            Website
          </p>
          <p className="text-xs text-gray-500 mt-6">
            Website designed and built by Jamie Clague
          </p>
        </div>
      </footer>
      <BackToTop />
    </div>
  );
};

export default WeddingGallery;
