import { useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior = reduce ? "auto" : "smooth";
  el.scrollIntoView({ behavior, block: "start" });
  if (reduce) return;

  // Right after a mount the lazy images and the IO-gated Lanyard have not
  // contributed their height yet, so the first measurement aims too high.
  requestAnimationFrame(() => el.scrollIntoView({ behavior, block: "start" }));
  document.fonts?.ready.then(() => el.scrollIntoView({ behavior, block: "start" }));
}

// Navigating does not move the scroll position on its own: history.pushState
// leaves it where it was, so clicking a project card 6000px down opened the
// detail page already scrolled past its hero.
export function useScrollReset() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const saved = useRef(new Map());
  const keyRef = useRef(location.key);
  keyRef.current = location.key;
  const prevPathname = useRef(location.pathname);

  // Recorded continuously rather than on navigation, because by the time an
  // effect runs the outgoing page has already been replaced and its offset may
  // have been clamped to the new, shorter document.
  useEffect(() => {
    const record = () => saved.current.set(keyRef.current, window.scrollY);
    record();
    window.addEventListener("scroll", record, { passive: true });
    return () => window.removeEventListener("scroll", record);
  }, []);

  useEffect(() => {
    // Search-param-only updates (the project filter writes ?q=&cat=) produce a
    // new location.key without changing the page; resetting on those would
    // yank the visitor to the top every time they click a category chip.
    if (prevPathname.current === location.pathname) return;
    prevPathname.current = location.pathname;

    // App owns forward navigations that carry a section to reveal. Back and
    // forward still restore here, which is where the visitor left off.
    if (navigationType !== "POP" && location.state?.scrollTo) return;

    const top = navigationType === "POP" ? (saved.current.get(location.key) ?? 0) : 0;
    // <html> carries .scroll-smooth, so an animated reset would glide the whole
    // page back to the top on every navigation.
    window.scrollTo({ top, left: 0, behavior: "instant" });
  }, [location.pathname, location.key, location.state, navigationType]);
}
