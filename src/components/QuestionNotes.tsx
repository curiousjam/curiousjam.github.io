import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import { questions } from "../content";

function Arrow({ direction }: { direction: "previous" | "next" }) {
  const previous = direction === "previous";
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path d={previous ? "M12.5 5.5 8 10l4.5 4.5" : "M7.5 5.5 12 10l-4.5 4.5"} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function QuestionNotes() {
  const [index, setIndex] = useState(0);
  const notes = useRef<HTMLElement | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const go = useCallback((direction: number) => setIndex(current => (current + direction + questions.length) % questions.length), []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("analytics-content-view", {
      detail: {
        section_id: "thinking",
        section_label: "thinking",
        content_type: "question",
        content_id: `question_${index + 1}`,
        content_label: questions[index],
        topic_primary: "current interests",
        position_index: index + 1,
        selected_context: `question_${index + 1}`,
      },
    }));
  }, [index]);

  useEffect(() => {
    const onWindowKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      const target = event.target as HTMLElement | null;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return;
      if (target?.closest("input, textarea, select, [contenteditable], [role='radiogroup']")) return;
      const bounds = notes.current?.getBoundingClientRect();
      if (!bounds || bounds.bottom < 0 || bounds.top > window.innerHeight) return;
      event.preventDefault();
      go(event.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onWindowKey);
    return () => window.removeEventListener("keydown", onWindowKey);
  }, [go]);
  const onTouchEnd = (event: TouchEvent) => {
    const start = touch.current;
    const end = event.changedTouches[0];
    touch.current = null;
    if (!start || !end) return;
    const dx = end.clientX - start.x;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(end.clientY - start.y) * 1.5) go(dx < 0 ? 1 : -1);
  };

  return (
    <aside ref={notes} className="question-notes" id="thinking" aria-labelledby="thinking-heading" data-no-cursor-cycle data-analytics-section="thinking"
      onTouchStart={event => { const point = event.touches[0]; touch.current = { x: point.clientX, y: point.clientY }; }}
      onTouchEnd={onTouchEnd}>
      <div className="note-heading"><h2 id="thinking-heading">Questions I’m thinking about</h2></div>
      <div className="note-sheet">
        <div className="note-page" aria-live="polite" aria-atomic="true">
          <p className="note-question" key={index}>{questions[index]}</p>
        </div>
        <div className="note-controls">
          <span className="note-count" aria-label={`Question ${index + 1} of ${questions.length}`}>{String(index + 1).padStart(2, "0")} <span>/ {String(questions.length).padStart(2, "0")}</span></span>
          <div>
            <button type="button" onClick={() => go(-1)} aria-label="Previous question" aria-keyshortcuts="ArrowLeft" data-track="question_previous" data-position-index={index + 1} data-selected-context={`question_${index + 1}`}><Arrow direction="previous" /></button>
            <button type="button" onClick={() => go(1)} aria-label="Next question" aria-keyshortcuts="ArrowRight" data-track="question_next" data-position-index={index + 1} data-selected-context={`question_${index + 1}`}><Arrow direction="next" /></button>
          </div>
        </div>
      </div>
    </aside>
  );
}
