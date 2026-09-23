import { Component, lazy, Suspense, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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

const MAX_TILT = 24;
const FREE_TILT = 32;
const IDLE_AMPLITUDE = 2.2;
const IDLE_PERIOD_MS = 5200;
const IDLE_STIFFNESS = 40;
const IDLE_DAMPING = 6;
const DRAG_STIFFNESS = 160;
const DRAG_DAMPING = 16;
// Pendulum used once the card is let go: omega^2 of a ~1.6 s period plus light
// damping, so a fling keeps swinging instead of snapping back to centre.
const PENDULUM_OMEGA_SQ = 15.4;
const PENDULUM_DAMPING = 0.5;
const DEG = Math.PI / 180;
// Autonomous showcase acts for the no-WebGL card: a swing kick, a flip that
// reveals the card back, or a toss, scheduled while it idles.
const FLIP_MS = 1400;
const ACT_GAP_MS = [6000, 11000];

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
    const s = (sim.current = {
      angle: 0,
      velocity: 0,
      target: 0,
      dragging: false,
      free: false,
      pivot: null,
      flipStart: null,
      nextAct: performance.now() + 3000,
      epoch: performance.now(),
    });

    // One integrator drives three modes: idle sway, pointer follow while
    // pressed, and a free pendulum after release so a fling keeps swinging.
    let frame = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      if (reduce.matches) {
        s.angle = s.dragging ? s.target : 0;
        s.velocity = 0;
      } else if (s.dragging) {
        s.velocity += ((s.target - s.angle) * DRAG_STIFFNESS - s.velocity * DRAG_DAMPING) * dt;
        s.angle += s.velocity * dt;
      } else if (s.free) {
        const accel = (-PENDULUM_OMEGA_SQ * Math.sin(s.angle * DEG)) / DEG - s.velocity * PENDULUM_DAMPING;
        s.velocity += accel * dt;
        s.angle += s.velocity * dt;
        if (Math.abs(s.angle) < 1 && Math.abs(s.velocity) < 8) s.free = false;
      } else {
        s.target = Math.sin(((now - s.epoch) / IDLE_PERIOD_MS) * Math.PI * 2) * IDLE_AMPLITUDE;
        s.velocity += ((s.target - s.angle) * IDLE_STIFFNESS - s.velocity * IDLE_DAMPING) * dt;
        s.angle += s.velocity * dt;
        if (now > s.nextAct) {
          s.nextAct = now + ACT_GAP_MS[0] + Math.random() * (ACT_GAP_MS[1] - ACT_GAP_MS[0]);
          const sign = Math.random() < 0.5 ? -1 : 1;
          const act = Math.floor(Math.random() * 3);
          if (act === 0) s.velocity += 150 * sign;
          else if (act === 1) s.flipStart = now;
          else s.velocity += 110 * sign;
        }
      }
      let flip = 0;
      if (s.flipStart !== null && !reduce.matches) {
        const p = (now - s.flipStart) / FLIP_MS;
        if (p >= 1) s.flipStart = null;
        else flip = (0.5 - Math.cos(p * Math.PI) / 2) * 360;
      }
      s.angle = Math.max(-FREE_TILT, Math.min(FREE_TILT, s.angle));
      el.style.setProperty('--tilt', `${s.angle}deg`);
      el.style.setProperty('--flip', `${flip}deg`);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const move = (e) => {
      if (!s.dragging) return;
      s.target = tiltBetween(e.clientX, e.clientY, s.pivot);
    };
    const release = () => {
      if (!s.dragging) return;
      s.dragging = false;
      s.free = Math.abs(s.velocity) > 20 || Math.abs(s.angle) > 3;
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
    <div
      className="lanyard-fallback"
      onPointerDown={(e) => {
        const state = sim.current;
        const sway = swayRef.current;
        if (!state || !sway) return;
        const rect = sway.getBoundingClientRect();
        state.pivot = { x: rect.left + rect.width / 2, y: rect.top };
        state.dragging = true;
        state.free = false;
        state.target = tiltBetween(e.clientX, e.clientY, state.pivot);
      }}
    >
      <div className="lanyard-sway" ref={swayRef}>
        <div className="lanyard-strap" aria-hidden="true" />
        <div className="lanyard-card">
          <img
            src={CARD_FALLBACK}
            alt="Julian Arwansah's lanyard card"
            width={500}
            height={500}
            decoding="async"
          />
          <div className="lanyard-back" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function PerfBadge() {
  const [text, setText] = useState('measuring…');

  useEffect(() => {
    const probe = document.createElement('canvas');
    const ctx = probe.getContext('webgl');
    const dbg = ctx?.getExtension('WEBGL_debug_renderer_info');
    const gpu = dbg ? ctx.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'no-webgl';
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const loop = (t) => {
      frames += 1;
      if (t - last >= 500) {
        setText(`${Math.round((frames * 1000) / (t - last))} fps · ${gpu}`);
        frames = 0;
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return createPortal(<div className="lanyard-perf">{text}</div>, document.body);
}

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? <CardFallback /> : this.props.children;
  }
}

export default function Lanyard(props) {
  const [enabled] = useState(canRun3D);
  const [inView, setInView] = useState(false);
  const [loadScene, setLoadScene] = useState(false);
  const wrapperRef = useRef(null);
  const [showPerf] = useState(() => new URLSearchParams(window.location.search).has('perf'));
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
      {showPerf && <PerfBadge />}
      {enabled && loadScene ? (
        <Suspense fallback={<CardFallback />}>
          <SceneErrorBoundary>
            <LanyardScene {...props} active={inView} />
          </SceneErrorBoundary>
        </Suspense>
      ) : (
        <CardFallback />
      )}
    </div>
  );
}
