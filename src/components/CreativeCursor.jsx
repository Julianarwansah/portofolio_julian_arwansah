import { useEffect, useRef } from "react";

const INTERACTIVE = "a, button, [role='button'], input, textarea, select";

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
    const magnets = [...document.querySelectorAll("[data-magnetic]")];
    magnets.forEach((m) => {
      m.addEventListener("pointermove", magMove);
      m.addEventListener("pointerleave", magLeave);
    });

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
      magnets.forEach((m) => {
        m.removeEventListener("pointermove", magMove);
        m.removeEventListener("pointerleave", magLeave);
        m.style.transform = "";
      });
    };
  }, []);

  return <div ref={cursorRef} className="neo-cursor" aria-hidden="true" />;
}
