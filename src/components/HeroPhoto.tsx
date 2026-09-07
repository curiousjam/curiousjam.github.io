import { useEffect, useRef, useState } from "react";
import { profile } from "../content";

type Face = "artsy" | "twitter" | "work";

const FACES: { id: Face; src: string; position: string }[] = [
  { id: "artsy", src: profile.photos.artsy, position: "center 18%" },
  { id: "twitter", src: profile.photos.twitter, position: "center 22%" },
  { id: "work", src: profile.photos.work, position: "center 16%" },
];

function sectionFace(): Face {
  const mark = window.innerHeight * 0.3;
  const top = (id: string) => document.getElementById(id)?.getBoundingClientRect().top ?? Infinity;
  if (top("together") < mark) return "twitter";
  if (top("work") < mark) return "work";
  if (top("now") < mark) return "twitter";
  return "artsy";
}

export default function HeroPhoto() {
  const slotRef = useRef<HTMLDivElement>(null);
  const [face, setFace] = useState<Face>("artsy");
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let raf = 0;
    const sync = () => {
      raf = 0;
      setFace(sectionFace());
      const slot = slotRef.current;
      if (!slot) return;
      setCompact(slot.getBoundingClientRect().top < 8);
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("hashchange", sync);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  return (
    <div className="hero-slot" ref={slotRef}>
      <a
        className={`hero${compact ? " is-compact" : ""}`}
        href="#top"
        aria-label={`${profile.photoAlt}. Back to top`}
        data-track="back_to_top"
        data-hero-photo
      >
        <span className="hero-clip">
          {FACES.map((item) => (
            <img
              key={item.id}
              src={item.src}
              alt=""
              width={132}
              height={132}
              sizes={compact ? "48px" : "(max-width: 640px) 96px, 132px"}
              decoding="async"
              loading={item.id === "artsy" ? "eager" : "lazy"}
              fetchPriority={item.id === "artsy" ? "high" : "low"}
              className={face === item.id ? "is-on" : undefined}
              style={{ objectPosition: item.position }}
            />
          ))}
        </span>
      </a>
    </div>
  );
}
