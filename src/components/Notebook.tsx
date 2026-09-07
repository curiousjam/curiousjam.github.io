import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from "react";
import { questions } from "../content";

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

type Face = "front" | "open" | "back";

function Arrow({ dir }: { dir: "prev" | "next" }) {
  const isPrev = dir === "prev";
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      {isPrev ? (
        <path
          d="M15.5 5.5 8.5 12l7 6.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M8.5 5.5 15.5 12l-7 6.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function Ribbon() {
  return (
    <img
      className="notebook-ribbon"
      src="/assets/notebook-ribbon.png"
      alt=""
      aria-hidden="true"
      width={97}
      height={314}
    />
  );
}

export default function Notebook() {
  const [face, setFace] = useState<Face>("front");
  const [index, setIndex] = useState(0);
  const [turning, setTurning] = useState<"next" | "prev" | null>(null);
  const reduceRef = useRef(false);
  const lockRef = useRef(false);
  const touchX = useRef<number | null>(null);
  const last = questions.length - 1;

  useEffect(() => {
    const mq = window.matchMedia(REDUCE_QUERY);
    const sync = () => {
      reduceRef.current = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (lockRef.current) return;

      const apply = (nextFace: Face, nextIndex = index) => {
        if (reduceRef.current || nextFace !== "open" || face !== "open") {
          setFace(nextFace);
          setIndex(nextIndex);
          return;
        }
        lockRef.current = true;
        setTurning(dir === 1 ? "next" : "prev");
        try {
          navigator.vibrate?.(8);
        } catch {
          /* ignore */
        }
        window.setTimeout(() => {
          setIndex(nextIndex);
          setFace(nextFace);
        }, 210);
        window.setTimeout(() => {
          setTurning(null);
          lockRef.current = false;
        }, 420);
      };

      if (face === "front") {
        if (dir === 1) {
          setIndex(0);
          setFace("open");
        }
        return;
      }

      if (face === "back") {
        if (dir === -1) apply("open", last);
        return;
      }

      if (dir === 1) {
        if (index >= last) apply("back");
        else apply("open", index + 1);
        return;
      }

      if (index <= 0) apply("front");
      else apply("open", index - 1);
    },
    [face, index, last],
  );

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      if (face === "front") {
        e.preventDefault();
        setIndex(0);
        setFace("open");
      } else if (face === "back") {
        e.preventDefault();
        setFace("front");
        setIndex(0);
      }
      return;
    }
    if (e.key === "Escape") {
      setFace("front");
      setIndex(0);
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  };

  const onTouchStart = (e: TouchEvent) => {
    if (face !== "open") return;
    touchX.current = e.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: TouchEvent) => {
    if (face !== "open") return;
    const start = touchX.current;
    touchX.current = null;
    if (start == null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) < 40) return;
    go(dx < 0 ? 1 : -1);
  };

  return (
    <section className="notebook-wrap" id="thinking" aria-labelledby="notebook-heading" data-no-cursor-cycle>
      <h2 id="notebook-heading" className="visually-hidden">
        Things I am thinking about
      </h2>
      <div
        className={`notebook is-${face}${turning ? ` is-turning-${turning}` : ""}`}
        tabIndex={0}
        role="region"
        aria-roledescription="notebook"
        aria-label="Things I am thinking about"
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {face !== "open" ? (
          <button
            type="button"
            className={`notebook-cover${face === "back" ? " is-back" : ""}`}
            aria-label={face === "back" ? "Back cover. Open from the start." : "Open notebook, Thinking about"}
            data-track={face === "back" ? "notebook_back" : "notebook_open"}
            onClick={() => {
              if (face === "back") {
                setFace("front");
                setIndex(0);
                return;
              }
              setIndex(0);
              setFace("open");
            }}
          >
            <Ribbon />
            {face === "front" ? (
              <span className="notebook-cover-title">
                Thinking
                <br />
                about
              </span>
            ) : (
              <span className="visually-hidden">Back cover. Open from the start.</span>
            )}
            <span className="notebook-spine" aria-hidden="true" />
            <span className="notebook-pages" aria-hidden="true" />
          </button>
        ) : (
          <div className="notebook-open">
            <button
              type="button"
              className="notebook-arrow notebook-arrow-prev"
              onClick={() => go(-1)}
              aria-label="Previous page"
              data-track="notebook_prev"
            >
              <Arrow dir="prev" />
            </button>
            <div className="notebook-spread">
              <span className="notebook-spine" aria-hidden="true" />
              <Ribbon />
              <div className="notebook-leaf">
                <p className="notebook-hand" aria-live="polite">
                  {questions[index]}
                </p>
                <span className="notebook-folio" aria-hidden="true">
                  {index + 1} / {questions.length}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="notebook-arrow notebook-arrow-next"
              onClick={() => go(1)}
              aria-label="Next page"
              data-track="notebook_next"
            >
              <Arrow dir="next" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
