import { useEffect } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(name: string, params?: Record<string, string | number | boolean>) {
  window.gtag?.("event", name, params);
}

function labelFor(el: HTMLElement) {
  return (
    el.getAttribute("data-track") ||
    el.getAttribute("aria-label") ||
    el.textContent?.replace(/\s+/g, " ").trim() ||
    el.getAttribute("href") ||
    "unknown"
  );
}

function contentType(href: string, raw: string) {
  if (raw === "back_to_top") return "back_to_top";
  if (raw === "email_resume" || href.endsWith("#contact")) return "email_resume";
  if (raw.startsWith("work_sort") || raw === "about_by_problem" || raw === "about_timeline") {
    return "work_sort";
  }
  if (raw.startsWith("nav_")) return "nav";
  if (raw.startsWith("notebook")) return "notebook";
  if (raw.startsWith("dock_")) return "dock";
  if (raw === "work_source") return "work_source";
  if (href.includes("twitter.com") || href.includes("x.com")) return "x";
  if (href.includes("linkedin.com")) return "linkedin";
  if (href.includes("llms.txt")) return "llms";
  return "ui";
}

export default function Analytics() {
  useEffect(() => {
    const seen = new Set<number>();

    const onClick = (event: MouseEvent) => {
      const el = (event.target as HTMLElement | null)?.closest<HTMLElement>(
        "a, button, [data-track]",
      );
      if (!el || el.classList.contains("nav-backdrop") || el.classList.contains("skip-link")) {
        return;
      }
      if (el.getAttribute("aria-label") === "Close menu") return;

      const href = el instanceof HTMLAnchorElement ? el.href : el.getAttribute("href") || "";
      const raw = el.getAttribute("data-track") || "";
      const type = contentType(href, raw);
      const itemId = labelFor(el).slice(0, 80);

      track("select_content", {
        content_type: type,
        item_id: itemId,
        link_url: href.slice(0, 180),
      });

      if (type === "email_resume") {
        track("generate_lead", {
          method: "email",
          item_id: "resume",
        });
      }
    };

    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const percent = Math.min(100, Math.round((window.scrollY / max) * 100));
      for (const mark of [25, 50, 75, 90, 100]) {
        if (percent >= mark && !seen.has(mark)) {
          seen.add(mark);
          track("scroll", { percent_scrolled: mark });
        }
      }
    };

    const observed = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = (entry.target as HTMLElement).id;
          if (!id || observed.has(id)) continue;
          observed.add(id);
          track("view_item", { item_id: id, item_name: id });
        }
      },
      { threshold: 0.45 },
    );

    for (const id of ["now", "thinking", "work", "together"]) {
      const node = document.getElementById(id);
      if (node) io.observe(node);
    }

    const onHash = () => {
      const hash = window.location.hash.replace("#", "") || "top";
      track("view_item", { item_id: hash, item_name: hash });
    };
    window.addEventListener("hashchange", onHash);

    document.addEventListener("click", onClick, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onHash);
      io.disconnect();
    };
  }, []);

  return null;
}
