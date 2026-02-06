import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Reception from "@/pages/Reception";
import Ceremony from "@/pages/Ceremony";
import WeddingGallery from "@/pages/WeddingGallery";
import HenPartyQuiz from "@/pages/HenPartyQuiz";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home className="h-[17691px]" />} />
          <Route path="/reception" element={<Reception />} />
          <Route path="/ceremony" element={<Ceremony />} />
          <Route path="/wedding-gallery" element={<WeddingGallery />} />
          <Route path="/hen-party-quiz" element={<HenPartyQuiz />} />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" element={null} />
          )}
        </Routes>
      </>
    </Suspense>
  );
}

export default App;
