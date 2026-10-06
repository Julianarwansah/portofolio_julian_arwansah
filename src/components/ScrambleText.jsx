import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*+=<>";

// Renders exactly text.length characters from the first frame, so the box
// holding it has its final character count immediately — unlike a typewriter,
// which grows its container one glyph per tick.
export default function ScrambleText({ text, duration = 500, skipMount = false }) {
  const [output, setOutput] = useState(text);
  const ref = useRef(null);
  const firstRun = useRef(true);

  useEffect(() => {
    const el = ref.current;
    // output starts as the final text, so this first measurement is the final
    // width; pinning it stops the box collapsing as narrower glyphs appear.
    if (el) el.style.minWidth = `${el.getBoundingClientRect().width}px`;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (skipMount && firstRun.current) {
      firstRun.current = false;
      return;
    }
    firstRun.current = false;

    const start = performance.now();
    let raf = 0;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const settled = Math.floor(progress * text.length);
      setOutput(
        text
          .split("")
          .map((char, i) =>
            i < settled || char === " " ? char : GLYPHS[(Math.random() * GLYPHS.length) | 0]
          )
          .join("")
      );
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration, skipMount]);

  return <span ref={ref}>{output}</span>;
}
