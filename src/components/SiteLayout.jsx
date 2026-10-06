import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import AOS from "aos";
import App from "../App.jsx";
import ProjectDetail from "../pages/ProjectDetail.jsx";
import NotFound from "../pages/NotFound.jsx";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";
import CreativeCursor from "./CreativeCursor";
import KonamiConfetti from "./KonamiConfetti";
import CommandPalette from "./CommandPalette/CommandPalette";

// Chrome shared by every route, mounted once. Each page used to render its own
// copy, and CreativeCursor's cleanup removed body.has-custom-cursor — which
// killed the instance that survived the transition.
export default function SiteLayout() {
  return (
    <>
      <ScrollProgress />
      <CreativeCursor />
      <KonamiConfetti />
      <CommandPalette />
      <div className="container mx-auto px-4 sm:px-6">
        <Navbar />
        <PageTransition />
        <Footer />
      </div>
    </>
  );
}

// Routes are rendered inside the animated element with an explicit `location`
// rather than through a layout route's <Outlet/>. Outlet reads the live
// RouteContext, so the exiting tree would repaint with the incoming page and
// the visitor would watch the new page fade out and then fade back in.
function PageTransition() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  // Opacity only: a transform here would re-raster the Lanyard WebGL layer on
  // every frame of the transition.
  const duration = reduceMotion ? 0 : 0.16;

  // AOS measured the document once at module scope. A page entered later is a
  // fresh tree of unmeasured [data-aos] nodes, and with once:true they would
  // stay at opacity 0 forever.
  useEffect(() => {
    const timer = setTimeout(() => AOS.refreshHard(), duration * 1000 + 40);
    return () => clearTimeout(timer);
  }, [location.pathname, duration]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration, ease: "easeOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<App />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
