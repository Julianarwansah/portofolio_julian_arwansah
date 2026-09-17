import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import "./ChromaGrid.css";

export const ChromaGrid = ({
  items,
  onItemClick,
  className = "",
  radius = 300,
  columns = 3,
  rows = 2,
  damping = 0.45,
  fadeOut = 0.6,
  ease = "power3.out",
}) => {
  const rootRef = useRef(null);
  const fadeRef = useRef(null);
  const setX = useRef(null);
  const setY = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const frame = useRef(0);
  const spotlightTween = useRef(null);
  const fadeTween = useRef(null);

  const data = items?.length ? items : [];

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, "--x", "px");
    setY.current = gsap.quickSetter(el, "--y", "px");
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);

    return () => {
      cancelAnimationFrame(frame.current);
      spotlightTween.current?.kill();
      fadeTween.current?.kill();
    };
  }, []);

  const moveTo = (x, y) => {
    spotlightTween.current = gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const revealSpotlight = () => {
    fadeTween.current = gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleMove = (e) => {
    const x = e.clientX;
    const y = e.clientY;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = rootRef.current.getBoundingClientRect();
      moveTo(x - r.left, y - r.top);
      revealSpotlight();
    });
  };

  const handleLeave = () => {
    cancelAnimationFrame(frame.current);
    fadeTween.current = gsap.to(fadeRef.current, {
      opacity: 1,
      duration: fadeOut,
      overwrite: true,
    });
  };

  const handleCardMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  // Keyboard focus must lift the grayscale overlay off the focused card,
  // otherwise the focus ring and content sit behind the desaturating mask.
  const handleCardFocus = (e) => {
    const card = e.currentTarget;
    const root = rootRef.current.getBoundingClientRect();
    const rect = card.getBoundingClientRect();
    moveTo(rect.left - root.left + rect.width / 2, rect.top - root.top + rect.height / 2);
    revealSpotlight();
  };

  const handleCardKeyDown = (e, card) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onItemClick(card);
    }
  };

  return (
    <div
      ref={rootRef}
      className={`chroma-grid ${className}`}
      style={
        {
          "--r": `${radius}px`,
          "--cols": columns,
          "--rows": rows,
        }
      }
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {data.map((c) => (
        <article
          key={c.slug ?? c.id}
          className="chroma-card"
          role="button"
          tabIndex={0}
          aria-label={`Open details for ${c.title}`}
          onMouseMove={handleCardMove}
          onFocus={handleCardFocus}
          onClick={() => onItemClick(c)}
          onKeyDown={(e) => handleCardKeyDown(e, c)}
          style={
            {
              "--card-border": c.borderColor || "transparent",
              "--card-gradient": c.gradient,
              cursor: "pointer",
            }
          }
        >
          <div className="chroma-img-wrapper">
            <img src={c.image} alt={`Screenshot of ${c.title}`} width={320} height={180} loading="lazy" decoding="async" />
          </div>
          <div className="chroma-info">
            <h3 className="name">{c.title}</h3>
            {c.handle && <span className="handle">{c.handle}</span>}
            <p className="role">{c.subtitle}</p>
            {c.location && <span className="location">{c.location}</span>}
          </div>
        </article>
      ))}
      <div className="chroma-overlay" />
      <div ref={fadeRef} className="chroma-fade" />
    </div>
  );
};

export default ChromaGrid;
