import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import ServerError from "./pages/ServerError.jsx";

const About = lazy(() => import("./pages/About.jsx"));
const ARWrapper = lazy(() => import("./pages/ARWrapper.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const Maintenance = lazy(() => import("./pages/Maintenance.jsx"));

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/ar" element={<ARWrapper />} />
            <Route path="/ar/:id" element={<ARWrapper />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/error" element={<ServerError />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
