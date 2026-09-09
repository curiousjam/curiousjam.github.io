import { useEffect } from "react";

const DESKTOP_QUERY = "(hover: hover) and (pointer: fine) and (min-width: 769px)";
const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

export default function GlowFollow() {
  useEffect(() => {
    const desktopMq = window.matchMedia(DESKTOP_QUERY);
    const reduceMq = window.matchMedia(REDUCE_QUERY);
    const root = document.documentElement;
    let raf = 0;
    let mx = 0.72;
    let my = 0.18;
    let tx = 0.72;
    let ty = 0.18;
    let running = false;
    let mode: "off" | "mouse" | "scroll" = "off";

    const apply = (x: number, y: number) => {
      root.style.setProperty("--wash-x", `${((x - 0.5) * 78).toFixed(2)}px`);
      root.style.setProperty("--wash-y", `${((y - 0.5) * 52).toFixed(2)}px`);
    };

    const tick = () => {
      mx += (tx - mx) * 0.08;
      my += (ty - my) * 0.08;
      apply(mx, my);
      if (Math.abs(tx - mx) + Math.abs(ty - my) < 0.002) {
        running = false;
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const kick = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      tx = e.clientX / window.innerWidth;
      ty = e.clientY / window.innerHeight;
      kick();
    };

    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      tx = 0.72 - p * 0.32;
      ty = 0.18 + p * 0.52;
      kick();
    };

    const stop = () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
      apply(0.72, 0.18);
    };

    const start = () => {
      stop();
      mx = 0.72;
      my = 0.18;
      tx = 0.72;
      ty = 0.18;
      if (reduceMq.matches) {
        mode = "off";
        return;
      }
      if (desktopMq.matches) {
        mode = "mouse";
        window.addEventListener("mousemove", onMove, { passive: true });
        return;
      }
      mode = "scroll";
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    };

    start();
    desktopMq.addEventListener("change", start);
    reduceMq.addEventListener("change", start);
    return () => {
      desktopMq.removeEventListener("change", start);
      reduceMq.removeEventListener("change", start);
      stop();
      void mode;
    };
  }, []);

  return null;
}
