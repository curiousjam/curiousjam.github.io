import { useEffect, useMemo, useState } from "react";
import { problemWorkGroups, reverseChronologicalWork, type WorkRole } from "../content";

type Sort = "focus" | "timeline";

function sortFromHash(): Sort {
  if (typeof window === "undefined") return "focus";
  return window.location.hash === "#timeline" ? "timeline" : "focus";
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
              data-track="work_source"
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
  const [sort, setSort] = useState<Sort>(sortFromHash);
  const grouped = useMemo(() => problemWorkGroups(), []);
  const chronological = useMemo(() => reverseChronologicalWork(), []);

  useEffect(() => {
    const onHash = () => setSort(sortFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const showProblem = () => {
    setSort("focus");
    if (window.location.hash !== "#by-problem") {
      window.location.hash = "by-problem";
    }
  };

  const showTimeline = () => {
    setSort("timeline");
    if (window.location.hash !== "#timeline") {
      window.location.hash = "timeline";
    }
  };

  return (
    <section className="work" id="work" aria-labelledby="work-heading">
      <h2 id="work-heading">Selected work</h2>
      <div className="work-sort" role="radiogroup" aria-label="Selected work order">
        <button
          type="button"
          id="by-problem"
          role="radio"
          aria-checked={sort === "focus"}
          className={sort === "focus" ? "is-on" : undefined}
          onClick={showProblem}
          data-track="work_sort_focus"
        >
          By problem
        </button>
        <button
          type="button"
          id="timeline"
          role="radio"
          aria-checked={sort === "timeline"}
          className={sort === "timeline" ? "is-on" : undefined}
          onClick={showTimeline}
          data-track="work_sort_chrono"
        >
          Reverse chronological
        </button>
      </div>
      {sort === "focus" ? (
        grouped.map((group) => (
          <div className="work-group" key={group.id}>
            <h3 className="work-category">{group.label}</h3>
            <ul>
              {group.items.map((item) => (
                <WorkRow key={`${item.years}-${item.org}`} item={item} />
              ))}
            </ul>
          </div>
        ))
      ) : (
        <ul>
          {chronological.map((item) => (
            <WorkRow key={`${item.years}-${item.org}`} item={item} />
          ))}
        </ul>
      )}
    </section>
  );
}
