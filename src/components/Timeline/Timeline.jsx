import { useEffect, useRef } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import "./Timeline.css";

export default function Timeline({ items }) {
  const hostRef = useRef(null);
  const railRef = useRef(null);
  const dotRefs = useRef([]);
  const stopsRef = useRef([]);

  const { scrollYProgress } = useScroll({
    target: hostRef,
    offset: ["start 75%", "end 65%"],
  });

  // Dot positions are measured once (and on resize) as fractions of the rail,
  // then driven off the same progress value — cheaper than an observer per dot,
  // and the class writes happen at most once per dot per traversal.
  useEffect(() => {
    const measure = () => {
      const rail = railRef.current;
      if (!rail) return;
      const railBox = rail.getBoundingClientRect();
      stopsRef.current = dotRefs.current.map((dot) => {
        const box = dot.getBoundingClientRect();
        return (box.top + box.height / 2 - railBox.top) / railBox.height;
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    dotRefs.current.forEach((dot, index) => {
      dot.classList.toggle("is-passed", value >= (stopsRef.current[index] ?? 1));
    });
  });

  return (
    <div className="xp-timeline" ref={hostRef}>
      <span className="xp-rail" ref={railRef} aria-hidden="true">
        <motion.span className="xp-rail-fill" style={{ scaleY: scrollYProgress }} />
      </span>
      <ol className="xp-list">
        {items.map((item, index) => (
          <li
            key={item.id}
            className="xp-item"
            data-aos="fade-up"
            data-aos-duration="1000"
            data-aos-once="true"
          >
            <span
              className="xp-dot"
              aria-hidden="true"
              ref={(node) => {
                dotRefs.current[index] = node;
              }}
            />
            <div className="xp-card">
              <div className="xp-head">
                <h3 className="xp-role">{item.judul}</h3>
                <span className="xp-period">{item.periode}</span>
              </div>
              <p className="xp-company">{item.instansi}</p>
              <p className="xp-desc">{item.deskripsi}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
