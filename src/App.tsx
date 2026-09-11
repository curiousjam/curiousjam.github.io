import { useCallback, useEffect, useId, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import Analytics from "./components/Analytics";
import HeroPhoto from "./components/HeroPhoto";
import EmojiCursor from "./components/EmojiCursor";
import GlowFollow from "./components/GlowFollow";
import QuestionNotes from "./components/QuestionNotes";
import WorkList from "./components/WorkList";
import {
  about,
  gatheringPost,
  mailComposeHref,
  moodUrl,
  now,
  profile,
  social,
  tinkering,
  together,
} from "./content";

type Theme = "light" | "dark";

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readTheme(): Theme {
  const stored = localStorage.getItem("theme-choice");
  if (stored === "dark" || stored === "light") return stored;
  return systemTheme();
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

const NAV = [
  { href: "#now", label: "Now" },
  { href: "#work", label: "Work" },
  { href: "#together", label: "Contact" },
] as const;

const NOW_LABELS = ["Building", "Writing", "Learning", "Gathering"] as const;

function SiteNav({ theme, onToggleTheme, compact }: { theme: Theme; onToggleTheme: (e: MouseEvent) => void; compact: boolean }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {open ? <button className="nav-backdrop" type="button" aria-label="Close menu" onClick={() => setOpen(false)} /> : null}
      <nav className={`site-nav${open ? " is-open" : ""}${compact ? " has-portrait" : ""}`} aria-label="Sections">
        <h1 className="nav-name"><a href="#top" aria-label="Back to top">{profile.name}</a></h1>
        <button type="button" className="nav-toggle" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((value) => !value)}>Menu</button>
        <ul id={menuId}>
          {NAV.map((item) => (
            <li key={item.href}><a href={item.href} data-track={`nav_${item.label}`} onClick={() => setOpen(false)}>{item.label}</a></li>
          ))}
        </ul>
        <button type="button" className="theme-toggle" onClick={onToggleTheme} aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}><SunIcon /></button>
      </nav>
    </>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 3v2.2M12 18.8V21M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3 12h2.2M18.8 12H21M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => typeof window === "undefined" ? "light" : readTheme());
  const [compact, setCompact] = useState(false);

  useEffect(() => applyTheme(theme), [theme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const stored = localStorage.getItem("theme-choice");
      if (stored === "dark" || stored === "light") return;
      setTheme(systemTheme());
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    const update = () => setTheme((current) => {
      const next: Theme = current === "light" ? "dark" : "light";
      localStorage.setItem("theme-choice", next);
      applyTheme(next);
      return next;
    });
    if (document.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const transition = document.startViewTransition(() => flushSync(update));
      void transition.ready.catch(() => {});
    } else update();
  }, []);

  const onMail = useCallback((e: MouseEvent) => {
    e.preventDefault();
    window.location.href = mailComposeHref();
  }, []);

  const onResume = useCallback((e: MouseEvent) => {
    e.preventDefault();
    window.location.href = mailComposeHref().replace(/subject=.*/, `subject=${encodeURIComponent("Request for your résumé")}`);
  }, []);

  return (
    <>
      <a className="skip-link" href="#content">Skip to content</a>
      <Analytics />
      <GlowFollow />
      <EmojiCursor />
      <div className="ambient-wash" aria-hidden="true" />
      <div className="reading-progress" aria-hidden="true" />
      <div className="site-shell">
        <SiteNav theme={theme} onToggleTheme={toggleTheme} compact={compact} />
        <main className="page" id="content">
          <header className="intro" id="about">
            <div className="intro-copy">
              <p className="intro-lede">{about[0]}</p>
              <div className="about-copy">
                <p>{about[1]}</p>
                <p>{about[2]}</p>
              </div>
            </div>
            <figure className="portrait">
              <HeroPhoto onCompactChange={setCompact} />
            </figure>
          </header>

          <QuestionNotes />

          <div className="present">
            <section className="now" id="now" aria-labelledby="now-heading">
              <h2 id="now-heading">Now</h2>
              <dl>
                {now.map((line, index) => <div key={line}><dt>{NOW_LABELS[index]}</dt><dd>{line}{index === 1 ? <a className="text-link" href={social.twitter} target="_blank" rel="noreferrer">X ↗</a> : null}{index === 3 ? <a className="text-link" href={gatheringPost} target="_blank" rel="noreferrer">X ↗</a> : null}</dd></div>)}
                <div>
                  <dt>Tinkering</dt>
                  <dd>{tinkering} <a className="text-link" href={moodUrl} target="_blank" rel="noreferrer" aria-label="Visit the museum experiment">👁️ 👁️ ↗</a></dd>
                </div>
              </dl>
            </section>
          </div>

          <WorkList />

          <footer className="contact" id="together" aria-labelledby="together-heading">
            <h2 id="together-heading">Contact</h2>
            <p>{together}</p>
            <div className="contact-links">
              <a className="text-link" href="#contact" onClick={onMail} data-track="email_resume">Email me ↗</a>
              <a className="text-link" href={social.linkedin} target="_blank" rel="noreferrer" data-track="linkedin">LinkedIn ↗</a>
              <a className="text-link" href={social.twitter} target="_blank" rel="noreferrer" data-track="x_dm">X ↗</a>
              <a className="text-link" href="#contact" onClick={onResume} data-track="request_resume">Request résumé ↗</a>
            </div>
            <a className="robots-link" href="/llms.txt" data-track="for_robots">For robots ↗</a>
          </footer>
        </main>
      </div>
    </>
  );
}
