import { useEffect, useMemo, useState } from "react";
import {
  reverseChronologicalWork,
  type WorkRole,
} from "../content";

type RoleFilterId =
  | "partnerships"
  | "marketplace"
  | "zero_to_one"
  | "platforms"
  | "product_management"
  | "program_management"
  | "people_management"
  | "product"
  | "ai";

type View =
  | { mode: "highlights" }
  | { mode: "role"; role: RoleFilterId }
  | { mode: "timeline" };

const ROLE_HASH_PREFIX = "resume-role-";
const HIGHLIGHT_KEYS = new Set([
  "2026-present-Consumer marketplace",
  "2019-2022-Google Meet",
  "2015-2018-Google Maps Platform",
  "2010-2013-Google Cloud · Asia Pacific",
]);

const ROLE_FILTERS: { id: RoleFilterId; label: string; roles: string[] }[] = [
  {
    id: "partnerships",
    label: "Product partnerships",
    roles: [
      "2026-present-Consumer marketplace",
      "2019-Google Meet hardware",
      "2015-2018-Google Maps Platform",
      "2014-Google Maps Platform",
      "2010-2013-Google Cloud · Asia Pacific",
    ],
  },
  {
    id: "marketplace",
    label: "Marketplace",
    roles: [
      "2026-present-Consumer marketplace",
      "2019-2022-Google Meet",
      "2015-2018-Google Maps Platform",
      "2014-Google Maps Platform",
      "2010-2013-Google Cloud · Asia Pacific",
    ],
  },
  {
    id: "zero_to_one",
    label: "0→1",
    roles: [
      "2026-present-Consumer marketplace",
      "2015-2018-Google Maps Platform",
      "2010-2013-Google Cloud · Asia Pacific",
    ],
  },
  {
    id: "platforms",
    label: "Developer platform",
    roles: [
      "2023-Google ChromeOS",
      "2019-2022-Google Meet",
      "2015-2018-Google Maps Platform",
      "2014-Google Maps Platform",
    ],
  },
  {
    id: "product_management",
    label: "Product management",
    roles: [
      "2023-Google ChromeOS",
      "2019-2022-Google Meet",
      "2019-Google Jamboard",
      "2015-2018-Google Maps Platform",
      "2014-Google Maps Platform",
    ],
  },
  {
    id: "program_management",
    label: "Program management",
    roles: [
      "2026-present-Consumer marketplace",
      "2025-Meta AI",
      "2019-2022-Google Meet",
      "2019-Google Meet hardware",
      "2019-Google Jamboard",
      "2015-2018-Google Maps Platform",
      "2014-Google Maps Platform",
      "2010-2013-Google Cloud · Asia Pacific",
    ],
  },
  {
    id: "people_management",
    label: "People management",
    roles: [
      "2019-2022-Google Meet",
      "2019-Google Meet hardware",
      "2019-Google Jamboard",
      "2015-2018-Google Maps Platform",
      "2014-Google Maps Platform",
    ],
  },
  {
    id: "product",
    label: "Product strategy & operations",
    roles: [
      "2026-present-Consumer marketplace",
      "2023-Google ChromeOS",
      "2019-2022-Google Meet",
      "2019-Google Meet hardware",
      "2019-Google Jamboard",
      "2025-Meta AI",
      "2015-2018-Google Maps Platform",
    ],
  },
  {
    id: "ai",
    label: "AI operations",
    roles: ["2026-present-Consumer marketplace", "2025-Meta AI"],
  },
];

function viewFromHash(): View {
  if (typeof window === "undefined") return { mode: "highlights" };
  const hash = window.location.hash.replace("#", "");
  if (hash === "timeline") return { mode: "timeline" };
  if (hash.startsWith(ROLE_HASH_PREFIX)) {
    const role = hash.slice(ROLE_HASH_PREFIX.length) as RoleFilterId;
    if (ROLE_FILTERS.some((item) => item.id === role)) {
      return { mode: "role", role };
    }
  }
  return { mode: "highlights" };
}

function WorkRow({ item }: { item: WorkRole }) {
  return (
    <li>
      <div className="work-row">
        <span className="work-years">{item.years}</span>
        <span className="work-copy">
          <span className="work-org">{item.org}</span>
          <span className="work-summary">{item.summary}</span>
          {item.source && item.sourceLabel ? (
            <a
              className="work-source"
              href={item.source}
              target="_blank"
              rel="noreferrer"
              data-track={`work_source_${item.org.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`}
            >
              {item.sourceLabel} ↗
            </a>
          ) : null}
        </span>
      </div>
    </li>
  );
}

export default function WorkList() {
  const [view, setView] = useState<View>(viewFromHash);
  const chronological = useMemo(() => reverseChronologicalWork(), []);
  const highlights = useMemo(
    () => chronological.filter((item) => HIGHLIGHT_KEYS.has(`${item.years}-${item.org}`)),
    [chronological],
  );

  const roleResults = useMemo(() => {
    if (view.mode !== "role") return [];
    const selected = ROLE_FILTERS.find((item) => item.id === view.role);
    return chronological.filter((item) => selected?.roles.includes(`${item.years}-${item.org}`));
  }, [chronological, view]);

  const results =
    view.mode === "timeline"
      ? chronological
      : view.mode === "role"
        ? roleResults
        : highlights;

  const searchValue =
    view.mode === "timeline"
      ? ""
      : view.mode === "role"
        ? ROLE_FILTERS.find((item) => item.id === view.role)?.label ?? ""
        : "";

  useEffect(() => {
    const onHash = () => setView(viewFromHash());
    window.addEventListener("hashchange", onHash);
    window.addEventListener("popstate", onHash);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("popstate", onHash);
    };
  }, []);

  const showRole = (role: RoleFilterId) => {
    setView({ mode: "role", role });
    window.history.pushState(null, "", `#${ROLE_HASH_PREFIX}${role}`);
  };

  const showTimeline = () => {
    setView({ mode: "timeline" });
    window.history.pushState(null, "", "#timeline");
  };

  const clearSearch = () => {
    setView({ mode: "highlights" });
    window.history.pushState(null, "", "#work");
  };

  return (
    <section className="work" id="work" aria-labelledby="work-heading">
      <div className="resume-work">
        <h2 id="work-heading">Work</h2>
        <div className="resume-search" aria-live="polite">
          <SearchIcon />
          <span className={`resume-search-value${searchValue ? "" : " is-placeholder"}`}>
            {searchValue || "Choose a focus"}
          </span>
          {view.mode === "role" ? (
            <button type="button" className="search-clear" onClick={clearSearch} aria-label="Clear selected focus" data-track="resume_clear">
              Clear
            </button>
          ) : null}
        </div>
        <div className="resume-queries" aria-label="Work focus filters">
          {ROLE_FILTERS.map((role) => (
            <button
              key={role.id}
              id={`${ROLE_HASH_PREFIX}${role.id}`}
              type="button"
              className={view.mode === "role" && view.role === role.id ? "is-on" : undefined}
              aria-pressed={view.mode === "role" && view.role === role.id}
              onClick={() => showRole(role.id)}
              data-track={`resume_role_${role.id}`}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      <div className="resume-results-header">
        <p aria-live="polite">
          {view.mode === "highlights"
            ? "View selected projects"
            : view.mode === "role"
              ? `${results.length} selected project${results.length === 1 ? "" : "s"}`
              : "Selected work"}
        </p>
        {view.mode !== "timeline" ? (
          <button type="button" onClick={showTimeline} data-track="work_sort_chrono">
            View full career timeline
          </button>
        ) : null}
      </div>

      <div className="resume-results" id={view.mode === "timeline" ? "timeline" : undefined}>
        <ul>
          {results.map((item) => (
            <WorkRow key={`${item.years}-${item.org}`} item={item} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.3" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m15.5 15.5 4.2 4.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
