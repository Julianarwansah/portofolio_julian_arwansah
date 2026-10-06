import { useScrollReset } from "../lib/scroll";

// Renderless. Lives outside <Routes> so it is never part of the animated page
// subtree and keeps running across route transitions.
export default function ScrollManager() {
  useScrollReset();
  return null;
}
