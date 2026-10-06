const OPEN_EVENT = "cmdk:open";

// The trigger lives in the Navbar while the palette itself mounts once above the
// routes, so the two meet through an event instead of a second context.
export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

export function onOpenCommandPalette(handler) {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}
