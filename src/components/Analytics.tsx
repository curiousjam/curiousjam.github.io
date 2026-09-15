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

type InteractionType = "link" | "button" | "role_filter" | "career_source" | "social_post" | "contact_action";

const STATIC_INTERACTIONS: Record<string, { label: string; type: InteractionType; topic: string; secondary?: string }> = {
  skip_to_content: { label: "Skip to content", type: "link", topic: "navigation" },
  nav_name: { label: "Back to top", type: "link", topic: "navigation" },
  nav_toggle: { label: "Menu", type: "button", topic: "navigation" },
  nav_backdrop_close: { label: "Close menu", type: "button", topic: "navigation" },
  nav_Now: { label: "Now", type: "link", topic: "current interests" },
  nav_Work: { label: "Work", type: "link", topic: "career history" },
  nav_Contact: { label: "Contact", type: "link", topic: "contact" },
  theme_toggle: { label: "Theme toggle", type: "button", topic: "site experience" },
  intro_product_management: { label: "products", type: "link", topic: "product management" },
  intro_marketplace: { label: "marketplaces", type: "link", topic: "marketplaces" },
  intro_developer_platform: { label: "developer platforms", type: "link", topic: "developer platforms" },
  intro_x: { label: "Thinking aloud on X", type: "social_post", topic: "AI and future of work" },
  now_x: { label: "Writing on X", type: "social_post", topic: "AI and future of work", secondary: "agents" },
  learning_x: { label: "Learning on X", type: "social_post", topic: "philosophy and psychology", secondary: "technological change" },
  gathering_x: { label: "Gathering on X", type: "social_post", topic: "community", secondary: "dinners and book clubs" },
  tinkering_art: { label: "Art project", type: "link", topic: "creative technology", secondary: "public-domain art" },
  tinkering_sports: { label: "Sports project", type: "link", topic: "sports and technology" },
  tinkering_music: { label: "Music project", type: "link", topic: "music and technology" },
  email_resume: { label: "Email me", type: "contact_action", topic: "contact" },
  linkedin: { label: "LinkedIn", type: "contact_action", topic: "professional network" },
  x_dm: { label: "X", type: "contact_action", topic: "contact" },
  request_resume: { label: "Request resume", type: "contact_action", topic: "career history" },
  for_robots: { label: "For robots", type: "link", topic: "site metadata" },
  question_previous: { label: "Previous question", type: "button", topic: "current interests" },
  question_next: { label: "Next question", type: "button", topic: "current interests" },
  back_to_top: { label: "Back to top", type: "link", topic: "navigation" },
  resume_clear: { label: "Clear selected focus", type: "button", topic: "career history" },
  work_sort_chrono: { label: "View full career timeline", type: "button", topic: "career history" },
};

function scrollDepth() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.round((window.scrollY / max) * 100) : 100;
}

function safeDestination(href: string | undefined) {
  if (!href) return undefined;
  if (href.startsWith("mailto:")) return "mailto";
  try {
    const url = new URL(href, window.location.href);
    url.search = "";
    url.hash = "";
    return url.origin === window.location.origin ? url.pathname : url.toString();
  } catch {
    return undefined;
  }
}

function send(name: string, params: Record<string, unknown> = {}) {
  window.gtag?.("event", name, params);
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
      if (!target || !name) return;
      const meta = STATIC_INTERACTIONS[name];
      const section = target.closest<HTMLElement>("[data-analytics-section]")?.dataset.analyticsSection || "site";
      const contentType = target.dataset.contentType || meta?.type || (target.tagName === "A" ? "link" : "button");
      send("site_interaction", {
        section_id: section,
        section_label: section,
        content_id: target.dataset.contentId || name,
        content_label: target.dataset.contentLabel || meta?.label || target.getAttribute("aria-label") || target.textContent?.trim() || name,
        content_type: contentType,
        topic_primary: target.dataset.topicPrimary || meta?.topic || "uncategorized",
        topic_secondary: target.dataset.topicSecondary || meta?.secondary,
        destination_url: safeDestination(target.getAttribute("href") || undefined),
        target: target.getAttribute("target") || "same_tab",
        scroll_depth: scrollDepth(),
        position_index: target.dataset.positionIndex ? Number(target.dataset.positionIndex) : undefined,
        selected_context: target.dataset.selectedContext,
      });
    };
    const milestones = [25, 50, 75, 90, 100];
    const sentMilestones = new Set<number>();
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const depth = scrollDepth();
        milestones.filter((milestone) => depth >= milestone && !sentMilestones.has(milestone)).forEach((milestone) => {
          sentMilestones.add(milestone);
          send("scroll_depth", { scroll_depth: milestone });
        });
      });
    };
    const seenSections = new Set<string>();
    const engagedSections = new Set<string>();
    const timers = new Map<string, number>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const section = (entry.target as HTMLElement).dataset.analyticsSection;
        if (!section) return;
        if (entry.intersectionRatio < 0.5) {
          const timer = timers.get(section);
          if (timer) {
            window.clearTimeout(timer);
            timers.delete(section);
          }
          return;
        }
        if (!seenSections.has(section)) {
          seenSections.add(section);
          send("section_view", { section_id: section, section_label: section, scroll_depth: scrollDepth() });
        }
        if (!engagedSections.has(section) && !timers.has(section)) {
          timers.set(section, window.setTimeout(() => {
            engagedSections.add(section);
            timers.delete(section);
            send("section_engaged", { section_id: section, section_label: section, dwell_seconds: 5, scroll_depth: scrollDepth() });
          }, 5000));
        }
      });
    }, { threshold: [0.5] });
    document.querySelectorAll<HTMLElement>("[data-analytics-section]:not(nav)").forEach((section) => observer.observe(section));
    const onContentView = (event: Event) => {
      const detail = (event as CustomEvent<Record<string, unknown>>).detail;
      send("content_view", { ...detail, scroll_depth: scrollDepth() });
    };
    const results = document.querySelector<HTMLElement>("[data-content-view]");
    const sendResultsView = (element: HTMLElement) => {
      send("content_view", {
        section_id: "work",
        section_label: "work",
        content_type: "career_results",
        content_id: element.dataset.contentView,
        content_label: element.dataset.contentViewLabel,
        selected_context: element.dataset.selectedContext,
        item_ids: element.dataset.contentViewItems,
        scroll_depth: scrollDepth(),
      });
    };
    const resultsObserver = results ? new MutationObserver(() => sendResultsView(results)) : undefined;
    if (results && resultsObserver) {
      resultsObserver.observe(results, { attributes: true, attributeFilter: ["data-content-view", "data-content-view-label", "data-selected-context", "data-content-view-items"] });
      sendResultsView(results);
    }
    const seenContentItems = new WeakSet<Element>();
    const contentItemObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio < 0.5 || seenContentItems.has(entry.target)) return;
        const element = entry.target as HTMLElement;
        seenContentItems.add(element);
        send("content_view", {
          section_id: element.dataset.analyticsSection || "work",
          section_label: element.dataset.analyticsSection || "work",
          content_id: element.dataset.contentViewItem,
          content_label: element.dataset.contentViewLabel,
          content_type: element.dataset.contentViewType || "content",
          topic_primary: element.dataset.topicPrimary,
          topic_secondary: element.dataset.topicSecondary,
          position_index: element.dataset.positionIndex ? Number(element.dataset.positionIndex) : undefined,
          selected_context: element.dataset.selectedContext,
          scroll_depth: scrollDepth(),
        });
      });
    }, { threshold: [0.5] });
    document.querySelectorAll<HTMLElement>("[data-content-view-item]").forEach((item) => contentItemObserver.observe(item));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", onHashChange);
    document.addEventListener("click", onClick);
    window.addEventListener("analytics-content-view", onContentView);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      resultsObserver?.disconnect();
      contentItemObserver.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", onHashChange);
      document.removeEventListener("click", onClick);
      window.removeEventListener("analytics-content-view", onContentView);
      script?.remove();
    };
  }, []);
  return null;
}
