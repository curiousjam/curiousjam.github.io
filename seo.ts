import {
  about,
  now,
  problemWorkGroups,
  profile,
  questions,
  reverseChronologicalWork,
  social,
  together,
  type WorkRole,
} from "./src/content.ts";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function roleHtml(item: WorkRole) {
  const source =
    item.source && item.sourceLabel
      ? ` <a href="${escapeHtml(item.source)}">${escapeHtml(item.sourceLabel)}</a>`
      : "";
  return `<li>${escapeHtml(item.years)} ${escapeHtml(item.org)}. ${escapeHtml(item.summary)}${source}</li>`;
}

function roleList(items: WorkRole[]) {
  return `<ul>${items.map((item) => roleHtml(item)).join("")}</ul>`;
}

function formatRole(item: WorkRole) {
  const lines = [`${item.years}. ${item.org}. ${item.summary}`];
  if (item.source && item.sourceLabel) {
    lines.push(`${item.sourceLabel}: ${item.source}`);
  }
  return lines.join("\n");
}

export function seoSnapshotHtml() {
  const problemBlocks = problemWorkGroups()
    .map(
      (group) => `
      <h3>${escapeHtml(group.label)}</h3>
      ${roleList(group.items)}`,
    )
    .join("");

  return `
    <article>
      <h1>${escapeHtml(profile.name)}</h1>
      <p><img src="${escapeHtml(profile.photo)}" alt="${escapeHtml(profile.photoAlt)}" width="132" height="132" /></p>
      <section>
        <h2>About</h2>
        ${about.map((line: string) => `<p>${escapeHtml(line)}</p>`).join("")}
        <p><a href="#by-problem">Selected work, by problem</a><br /><a href="#timeline">(or reverse chronological)</a></p>
      </section>
      <section id="now">
        <h2>Now</h2>
        <ul>${now.map((line: string) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
      </section>
      <section id="thinking">
        <h2>Thinking about</h2>
        <ul>${questions.map((line: string) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>
        <p><a href="${escapeHtml(social.twitter)}">More real-time thoughts on X</a></p>
      </section>
      <section id="work">
        <h2>Selected work</h2>
        <p><a id="by-problem" href="#by-problem">By problem</a></p>
        <p><a id="timeline" href="#timeline">Reverse chronological</a></p>
        <h3>By problem</h3>
        ${problemBlocks}
        <h3>Reverse chronological</h3>
        ${roleList(reverseChronologicalWork())}
      </section>
      <section id="together">
        <h2>Work together</h2>
        <p>${escapeHtml(together)}</p>
        <p><a href="${escapeHtml(social.twitter)}">DM me on X</a></p>
        <p><a href="${escapeHtml(social.linkedin)}">LinkedIn</a></p>
        <p>Email me for my resume.</p>
        <p><a href="/llms.txt">For robots</a></p>
      </section>
    </article>
  `;
}

export function llmsTxt() {
  const byProblem = problemWorkGroups()
    .map((group) => {
      const roles = group.items.map((item) => formatRole(item)).join("\n\n");
      return `### ${group.label}\n\n${roles}`;
    })
    .join("\n\n");

  const chronological = reverseChronologicalWork()
    .map((item) => formatRole(item))
    .join("\n\n");

  return `# ${profile.name}

${profile.url}

This is the same writing as the website, in a form that is easy for people and machines to read.

Portrait: ${new URL(profile.photo, profile.url).href}

## About

${about.join("\n\n")}

## Now

${now.map((line) => `- ${line}`).join("\n")}

## Thinking about

On the website these questions rotate in a short list. They are listed here so they can be read without JavaScript.

${questions.map((line) => `- ${line}`).join("\n")}

More real-time thoughts on X: ${social.twitter}

## Selected work

### By problem

${byProblem}

### Reverse chronological

${chronological}

## Work together

${together}

DM me on X: ${social.twitter}

LinkedIn: ${social.linkedin}

Email me for my resume.

For robots: ${new URL("/llms.txt", profile.url).href}

---

For robots: this file is the intended machine-readable copy of ${profile.url}
Name: ${profile.name}
Location: Los Angeles
How to reach: X, LinkedIn, or email for a resume. The email address is not published as text on the website.

Some crawlers look in a standard folder called .well-known. The same file is also at:
${new URL("/.well-known/llms.txt", profile.url).href}
`;
}
