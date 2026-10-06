import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// Section anchors shared by the Navbar, the command palette and the active
// section tracker. Derived from the live DOM rather than assumed, because
// #certificates only renders once listSertifikat has entries.
//
// `accent` must stay a literal class string: Tailwind scans source text
// statically, so a class assembled from a hex value would never be emitted.
export const SECTIONS = [
  { id: "home", label: "Home", accent: "hover:bg-[#ffe600]" },
  { id: "about", label: "About", accent: "hover:bg-[#ff007f]" },
  { id: "experience", label: "Experience", accent: "hover:bg-[#00e5ff]" },
  { id: "education", label: "Education", accent: "hover:bg-[#00e5ff]" },
  { id: "project", label: "Project", accent: "hover:bg-[#00ff66]" },
  { id: "contact", label: "Contact", accent: "hover:bg-[#00e5ff]" },
];

// Tracks which section owns the upper third of the viewport. Offsets are cached
// and compared against scrollY, so scrolling costs no layout reads; and because
// the winner is "the last section whose top has passed the probe", the highlight
// never flickers off in the 128px gaps between sections.
//
// Returns null when no section exists in the document, which is how routes
// other than the home page opt out without a pathname check.
export function useActiveSection() {
  const [active, setActive] = useState(null);
  const { pathname } = useLocation();

  useEffect(() => {
    let offsets = [];

    const measure = () => {
      offsets = SECTIONS.filter((section) => section.id !== "home")
        .map((section) => {
          const el = document.getElementById(section.id);
          return el ? { id: section.id, top: el.offsetTop } : null;
        })
        .filter(Boolean);
    };

    let raf = 0;
    const update = () => {
      raf = 0;
      // The cached offsets belong to whichever route rendered them. A detached
      // anchor means the route changed, so measure again before trusting them.
      if (offsets.length > 0 && !document.getElementById(offsets[0].id)?.isConnected) {
        measure();
      }
      if (offsets.length === 0) {
        setActive(null);
        return;
      }
      const probe = window.scrollY + window.innerHeight * 0.3;
      let current = "home";
      for (const entry of offsets) {
        if (entry.top <= probe) current = entry.id;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    measure();
    update();
    // And again once the incoming page has settled: with the route transition
    // in "wait" mode the outgoing page is still in the DOM when pathname
    // changes, so an immediate measure would capture the wrong route.
    const settle = setTimeout(() => {
      measure();
      update();
    }, 220);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("resize", onScroll);
    return () => {
      clearTimeout(settle);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      window.removeEventListener("resize", onScroll);
    };
    // Re-measure per route: the sections only exist on the home page, and the
    // cached offsets from a previous route would otherwise keep highlighting.
  }, [pathname]);

  return active;
}
