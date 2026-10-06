import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, [role='button'], input, textarea, select";

// Module scope on purpose: it survives StrictMode's mount/cleanup/remount, so an
// element is never bound twice. A second handler would read the first one's
// transform through getBoundingClientRect and compound the offset.
const boundMagnets = new WeakSet();

export default function CreativeCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    document.body.classList.add("has-custom-cursor");
    const el = cursorRef.current;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;
    let raf = 0;

    const loop = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };

    const move = (e) => {
      tx = e.clientX;
      ty = e.clientY;
      el.classList.toggle("cursor-hot", Boolean(e.target.closest?.(INTERACTIVE)));
    };
    const down = () => el.classList.add("cursor-down");
    const up = () => el.classList.remove("cursor-down");

    const magMove = (e) => {
      const m = e.currentTarget;
      const r = m.getBoundingClientRect();
      m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.24}px)`;
    };
    const magLeave = (e) => {
      e.currentTarget.style.transform = "";
    };

    // Bound lazily on first hover. This used to query [data-magnetic] exactly
    // once on mount, so magnets rendered later never became magnetic — which
    // matters now that this component outlives a single route and every page
    // entered after it mounted renders its own buttons.
    const bindMagnet = (m) => {
      if (boundMagnets.has(m)) return;
      boundMagnets.add(m);
      m.addEventListener("pointermove", magMove);
      m.addEventListener("pointerleave", magLeave);
    };
    const onOver = (e) => {
      if (!(e.target instanceof Element)) return;
      const magnet = e.target.closest("[data-magnetic]");
      if (magnet) bindMagnet(magnet);
    };

    document.querySelectorAll("[data-magnetic]").forEach(bindMagnet);
    document.addEventListener("pointerover", onOver, { passive: true });

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    raf = requestAnimationFrame(loop);

    return () => {
      document.body.classList.remove("has-custom-cursor");
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerover", onOver);
    };
  }, []);

  return <div ref={cursorRef} className="neo-cursor" aria-hidden="true" />;
}
