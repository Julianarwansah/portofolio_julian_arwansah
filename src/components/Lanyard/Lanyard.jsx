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

function tiltBetween(x, y, pivot) {
  if (!pivot) return 0;
  const deg = (Math.atan2(x - pivot.x, Math.max(y - pivot.y, 1)) * 180) / Math.PI;
  return Math.max(-MAX_TILT, Math.min(MAX_TILT, -deg));
}

function CardFallback() {
  const swayRef = useRef(null);
  const pivot = useRef(null);

  useEffect(() => {
    const move = (e) => {
      const el = swayRef.current;
      if (!el?.classList.contains('is-dragging')) return;
      el.style.setProperty('--tilt', `${tiltBetween(e.clientX, e.clientY, pivot.current)}deg`);
    };
    const release = () => {
      const el = swayRef.current;
      if (!el?.classList.contains('is-dragging')) return;
      el.classList.remove('is-dragging');
      el.classList.add('is-settling');
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    return () => {
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
          const rect = e.currentTarget.getBoundingClientRect();
          pivot.current = { x: rect.left + rect.width / 2, y: rect.top };
          e.currentTarget.classList.remove('is-settling');
          e.currentTarget.classList.add('is-dragging');
          e.currentTarget.style.setProperty('--tilt', `${tiltBetween(e.clientX, e.clientY, pivot.current)}deg`);
        }}
        onAnimationEnd={(e) => {
          if (e.animationName !== 'lanyard-settle') return;
          e.currentTarget.classList.remove('is-settling');
          e.currentTarget.style.removeProperty('--tilt');
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

    // The scene chunk carries the whole WebGL runtime, so it is only fetched
    // once the section is close to the viewport, then stays mounted.
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
