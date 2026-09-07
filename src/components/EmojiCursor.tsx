import { useEffect, useRef, useState } from "react";
import { emojiSet } from "../content";

const ENABLE_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 769px)";
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

function canUseEmojiCursor() {
  return (
    window.matchMedia(ENABLE_QUERY).matches &&
    !window.matchMedia(REDUCE_QUERY).matches
  );
}

export default function EmojiCursor() {
  const [enabled, setEnabled] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLSpanElement>(null);
  const idxRef = useRef(0);
  const photoHoverRef = useRef(false);
  const visibleRef = useRef(false);

  useEffect(() => {
    const enableMq = window.matchMedia(ENABLE_QUERY);
    const reduceMq = window.matchMedia(REDUCE_QUERY);
    const sync = () => setEnabled(canUseEmojiCursor());
    sync();
    enableMq.addEventListener("change", sync);
    reduceMq.addEventListener("change", sync);
    return () => {
      enableMq.removeEventListener("change", sync);
      reduceMq.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add("emoji-cursor");
    idxRef.current = Math.floor(Math.random() * emojiSet.length);
    if (emojiRef.current) emojiRef.current.textContent = emojiSet[idxRef.current];

    const setWave = (on: boolean) => {
      const wrap = cursorRef.current;
      const emoji = emojiRef.current;
      if (!wrap || !emoji) return;
      photoHoverRef.current = on;
      wrap.classList.toggle("is-waving", on);
      if (on) {
        emoji.textContent = "👋";
      } else {
        emoji.textContent = emojiSet[idxRef.current];
      }
    };

    const onMove = (e: MouseEvent) => {
      const el = cursorRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (!visibleRef.current) {
        visibleRef.current = true;
        el.style.opacity = "1";
      }
    };

    const onLeave = () => {
      visibleRef.current = false;
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
      setWave(false);
    };

    const onVisibility = () => {
      if (document.hidden) onLeave();
    };

    const onClick = (e: MouseEvent) => {
      if (photoHoverRef.current) return;
      if ((e.target as HTMLElement).closest("[data-no-cursor-cycle]")) return;
      idxRef.current = (idxRef.current + 1) % emojiSet.length;
      if (emojiRef.current && !photoHoverRef.current) {
        emojiRef.current.textContent = emojiSet[idxRef.current];
      }
    };

    const photo = document.querySelector("[data-hero-photo]");
    const onEnterPhoto = () => setWave(true);
    const onLeavePhoto = () => setWave(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("click", onClick);
    photo?.addEventListener("mouseenter", onEnterPhoto);
    photo?.addEventListener("mouseleave", onLeavePhoto);

    return () => {
      document.documentElement.classList.remove("emoji-cursor");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("click", onClick);
      photo?.removeEventListener("mouseenter", onEnterPhoto);
      photo?.removeEventListener("mouseleave", onLeavePhoto);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={cursorRef} className="emoji-follower" aria-hidden="true">
      <span ref={emojiRef}>{emojiSet[0]}</span>
    </div>
  );
}
