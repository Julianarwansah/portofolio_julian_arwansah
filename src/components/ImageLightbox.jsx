import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";

// Locks body scroll without the layout shift the disappearing 12px scrollbar
// would cause: the gutter width is reserved as padding for the duration.
function useScrollLock() {
  useEffect(() => {
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    const { overflow, paddingRight } = document.body.style;
    document.body.style.overflow = "hidden";
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, []);
}

export default function ImageLightbox({ src, alt, onClose }) {
  const closeRef = useRef(null);
  const restoreRef = useRef(null);

  useScrollLock();

  useEffect(() => {
    restoreRef.current = document.activeElement;
    closeRef.current?.focus();
    return () => {
      if (restoreRef.current && document.contains(restoreRef.current)) {
        restoreRef.current.focus();
      }
    };
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [onClose]);

  return createPortal(
    <div className="lightbox-backdrop" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={alt}
        className="lightbox-frame"
        onClick={(event) => event.stopPropagation()}
      >
        <img src={src} alt={alt} />
        <button ref={closeRef} type="button" onClick={onClose} className="lightbox-close" aria-label="Close image">
          <FiX size={20} aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body
  );
}
