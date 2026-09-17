import { useEffect } from "react";

function setMeta(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.setAttribute("content", value);
}

export function usePageMeta(title, description) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      const short = description.slice(0, 155);
      setMeta('meta[name="description"]', short);
      setMeta('meta[property="og:description"]', short);
      setMeta('meta[name="twitter:description"]', short);
    }
  }, [title, description]);
}
