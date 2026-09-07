import { useCallback, useEffect, useId, useState, type MouseEvent } from "react";
import Analytics from "./components/Analytics";
import GlowFollow from "./components/GlowFollow";
import EmojiCursor from "./components/EmojiCursor";
import HeroPhoto from "./components/HeroPhoto";
import Notebook from "./components/Notebook";
import WorkList from "./components/WorkList";
import { about, mailComposeHref, now, profile, social, together } from "./content";

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
  { href: "#thinking", label: "Thinking about" },
  { href: "#work", label: "Selected work" },
  { href: "#together", label: "Work together" },
] as const;

function SiteNav() {
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
      {open ? (
        <button
          type="button"
          className="nav-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <nav className={`site-nav${open ? " is-open" : ""}`} aria-label="Sections">
      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        Menu
      </button>
      <ul id={menuId}>
        {NAV.map((item) => (
          <li key={item.href}>
            <a href={item.href} data-track={`nav_${item.label}`} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
    </>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 3v2.2M12 18.8V21M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M3 12h2.2M18.8 12H21M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof window === "undefined" ? "light" : readTheme(),
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const stored = localStorage.getItem("theme-choice");
      if (stored === "dark" || stored === "light") return;
      const next = systemTheme();
      setTheme(next);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    setTheme((current) => {
      const next: Theme = current === "light" ? "dark" : "light";
      localStorage.setItem("theme-choice", next);
      applyTheme(next);
      return next;
    });
  }, []);

  const onMail = useCallback((e: MouseEvent) => {
    e.preventDefault();
    window.location.href = mailComposeHref();
  }, []);

  return (
    <>
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <Analytics />
      <GlowFollow />
      <EmojiCursor />
      <SiteNav />
      <main className="page" id="content">
        <HeroPhoto />

        <h1 className="name">{profile.name}</h1>

        <section className="stack" aria-labelledby="about-heading">
          <h2 id="about-heading" className="kicker">
            About
          </h2>
          {about.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p className="more-x about-work-jumps">
            <a href="#by-problem" data-track="about_by_problem">
              Selected work, by problem ↘
            </a>
            <a href="#timeline" data-track="about_timeline">
              (or reverse chronological) ↘
            </a>
          </p>
        </section>

        <section className="stack" id="now" aria-labelledby="now-heading">
          <h2 id="now-heading" className="kicker">
            Now
          </h2>
          <ul>
            {now.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <Notebook />

        <p className="more-x">
          <a href={social.twitter} target="_blank" rel="noreferrer" data-track="x_thoughts">
            More real-time thoughts on X ↗
          </a>
        </p>


        <WorkList />

        <section className="stack collab" id="together" aria-labelledby="together-heading">
          <h2 id="together-heading" className="kicker">
            Work together
          </h2>
          <p>{together}</p>
          <p className="more-x">
            <a href={social.twitter} target="_blank" rel="noreferrer" data-track="x_dm">
              DM me on X ↗
            </a>
          </p>
          <p className="more-x">
            <a href={social.linkedin} target="_blank" rel="noreferrer" data-track="linkedin">
              LinkedIn ↗
            </a>
          </p>
          <p className="more-x">
            <a href="#contact" onClick={onMail} aria-label="Email me for my resume" data-track="email_resume">
              Email me for my resume ↗
            </a>
          </p>
          <p className="more-x">
            <a href="/llms.txt" data-track="for_robots">For robots ↗</a>
          </p>
        </section>
      </main>

      <div className="dock">
        <nav className="dock-social" aria-label="Social links">
          <a href={social.twitter} target="_blank" rel="noreferrer" aria-label="X" data-track="dock_x">
            X
          </a>
          <span className="dot" aria-hidden="true">
            ·
          </span>
          <a href={social.linkedin} target="_blank" rel="noreferrer" data-track="dock_linkedin">
            LinkedIn
          </a>
          <span className="dot" aria-hidden="true">
            ·
          </span>
          <a href="#contact" onClick={onMail} aria-label="Email me for my resume" data-track="email_resume">
            Email
          </a>
        </nav>
      </div>

      <button
        type="button"
        className="theme-toggle"
        data-no-cursor-cycle
        data-track="theme_toggle"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        <SunIcon />
      </button>
    </>
  );
}
