import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import './Lanyard.css';

const LanyardScene = lazy(() => import('./LanyardScene'));

const CARD_FALLBACK = `${import.meta.env.BASE_URL}assets/cardjul.webp`;

function canRun3D() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (navigator.connection?.saveData) return false;

  try {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    return false;
  }
}

function CardFallback() {
  return (
    <div className="lanyard-fallback">
      <img
        src={CARD_FALLBACK}
        alt="Julian Arwansah's lanyard card"
        width={500}
        height={500}
        decoding="async"
      />
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
