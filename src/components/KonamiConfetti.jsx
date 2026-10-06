import { useEffect, useState } from "react";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const COLORS = ["#ffe600", "#00e5ff", "#ff007f", "#00ff66"];

const TYPING = "input, textarea, select, [contenteditable]";

// Renderless easter egg. Mounted above the routes so it works on every page,
// not just home.
export default function KonamiConfetti() {
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    let idx = 0;
    const onKey = (e) => {
      // Arrow keys are ordinary navigation inside a text field or the command
      // palette; counting them there would advance the sequence by accident.
      if (e.target instanceof Element && e.target.closest(TYPING)) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      idx = key === KONAMI[idx] ? idx + 1 : 0;
      if (idx === KONAMI.length) {
        idx = 0;
        setBurst((n) => n + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!burst || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const host = document.createElement("div");
    host.className = "confetti-host";
    for (let i = 0; i < 80; i++) {
      const piece = document.createElement("i");
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.background = COLORS[i % COLORS.length];
      piece.style.animationDelay = `${Math.random() * 0.4}s`;
      piece.style.animationDuration = `${1.6 + Math.random() * 1.2}s`;
      host.appendChild(piece);
    }
    document.body.appendChild(host);

    const timer = setTimeout(() => host.remove(), 3400);
    return () => {
      clearTimeout(timer);
      host.remove();
    };
  }, [burst]);

  return null;
}
