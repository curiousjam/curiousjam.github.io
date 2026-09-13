import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// The measurement ID is public configuration. Keep the env override for other previews,
// with Curious Jam as the portfolio's known default so local dev cannot silently disable tracking.
const measurementId = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) || "G-S9ZW8ZKLL8";

function pageView() {
  window.gtag?.("event", "page_view", { page_location: window.location.href });
}

export default function Analytics() {
  useEffect(() => {
    if (!measurementId) return;
    window.dataLayer = window.dataLayer || [];
    let script: HTMLScriptElement | undefined;
    if (!window.gtag) {
      window.gtag = (...args: unknown[]) => window.dataLayer.push(args);
      window.gtag("js", new Date());
      script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
      document.head.appendChild(script);
    }
    window.gtag("config", measurementId, { send_page_view: false });
    pageView();
    const onHashChange = () => pageView();
    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-track]") : null;
      const name = target?.dataset.track;
      if (name) {
        window.gtag?.("event", "resume_interaction", {
          interaction: name,
          link_url: target?.getAttribute("href") || undefined,
          link_text: target?.textContent?.trim() || undefined,
        });
      }
    };
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onClick);
      script?.remove();
    };
  }, []);
  return null;
}
