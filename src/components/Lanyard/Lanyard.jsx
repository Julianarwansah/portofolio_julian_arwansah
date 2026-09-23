import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import './Lanyard.css';

const LanyardScene = lazy(() => import('./LanyardScene'));

const CARD_FALLBACK = `${import.meta.env.BASE_URL}assets/cardjul.webp`;

function canRun3D() {
  if (typeof window === 'undefined') return false;

  try {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    return false;
  }
}

const MAX_TILT = 20;
const IDLE_AMPLITUDE = 2.2;
const IDLE_PERIOD_MS = 5200;
const SPRING_STIFFNESS = 90;
const SPRING_DAMPING = 9;

function tiltBetween(x, y, pivot) {
  if (!pivot) return 0;
  const deg = (Math.atan2(x - pivot.x, Math.max(y - pivot.y, 1)) * 180) / Math.PI;
  return Math.max(-MAX_TILT, Math.min(MAX_TILT, -deg));
}

function CardFallback() {
  const swayRef = useRef(null);
  const sim = useRef(null);

  useEffect(() => {
    const el = swayRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const s = (sim.current = { angle: 0, velocity: 0, target: 0, dragging: false, epoch: performance.now() });

    // One continuous spring integrator drives idle sway, drag follow and the
    // release swing; keyframed CSS eased to a stop at every keypoint and read
    // as stutter.
    let frame = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      if (!s.dragging && !reduce.matches) {
        s.target = Math.sin(((now - s.epoch) / IDLE_PERIOD_MS) * Math.PI * 2) * IDLE_AMPLITUDE;
      }
      if (reduce.matches && !s.dragging) {
        s.angle = s.target;
        s.velocity = 0;
      } else {
        s.velocity += ((s.target - s.angle) * SPRING_STIFFNESS - s.velocity * SPRING_DAMPING) * dt;
        s.angle += s.velocity * dt;
      }
      el.style.setProperty('--tilt', `${s.angle}deg`);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const move = (e) => {
      if (!s.dragging) return;
      s.target = tiltBetween(e.clientX, e.clientY, s.pivot);
    };
    const release = () => {
      s.dragging = false;
      el.classList.remove('is-dragging');
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
  }, []);

  return (
    <div className="lanyard-fallback">
      <div
        className="lanyard-sway"
        ref={swayRef}
        onPointerDown={(e) => {
          const sim2 = sim.current;
          if (!sim2) return;
          const rect = e.currentTarget.getBoundingClientRect();
          sim2.pivot = { x: rect.left + rect.width / 2, y: rect.top };
          sim2.dragging = true;
          sim2.target = tiltBetween(e.clientX, e.clientY, sim2.pivot);
          e.currentTarget.classList.add('is-dragging');
        }}
      >
        <div className="lanyard-strap" aria-hidden="true" />
        <img
          src={CARD_FALLBACK}
          alt="Julian Arwansah's lanyard card"
          width={500}
          height={500}
          decoding="async"
        />
      </div>
    </div>
  );
}

export default function Lanyard(props) {
  const [enabled] = useState(canRun3D);
  const [inView, setInView] = useState(false);
  const [loadScene, setLoadScene] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    // The scene chunk carries the WebGL + physics runtime, so it is only
    // fetched once the section is close to the viewport, then stays mounted.
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setLoadScene(true);
      },
      { rootMargin: '400px 0px' }
    );
    observer.observe(wrapperRef.current);

    return () => observer.disconnect();
  }, [enabled]);

  return (
    <div className="lanyard-wrapper" ref={wrapperRef}>
      {enabled && loadScene ? (
        <Suspense fallback={<CardFallback />}>
          <LanyardScene {...props} active={inView} />
        </Suspense>
      ) : (
        <CardFallback />
      )}
    </div>
  );
}
