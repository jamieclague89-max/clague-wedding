import { Suspense, lazy } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "@/components/home";
import Reception from "@/components/reception";
import Ceremony from "@/components/ceremony";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reception" element={<Reception />} />
          <Route path="/ceremony" element={<Ceremony />} />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" element={null} />
          )}
        </Routes>
      </>
    </Suspense>
  );
}

export default App;
