import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { about, footballUrl, learningPost, moodUrl, now, profile, resumeLenses, reverseChronologicalWork, social, sunoUrl, tinkering, together } from "./src/content.ts";

const root = dirname(fileURLToPath(import.meta.url));

// Keep this plain-text export portable when a client guesses the wrong charset.
function plainText(value: string) {
  return value.replace(/[“”]/g, '"').replace(/[’]/g, "'").replace(/·/g, " - ").replace(/—/g, " - ").replace(/→/g, "->");
}

function formatRole(item: ReturnType<typeof reverseChronologicalWork>[number]) {
  const source = item.source && item.sourceLabel ? ` - ${item.sourceLabel}: ${item.source}` : "";
  return `${item.years} - ${plainText(item.org)}\n${plainText(item.summary)}${source}`;
}

export function llmsTxt() {
  const roles = reverseChronologicalWork().map(formatRole).join("\n\n");
  return `# ${profile.name}

${profile.url}

## About

${about.map(plainText).join("\n\n")}

## Now

${now.map((line, index) => `${plainText(line)}${index === 2 ? ` X: ${learningPost}` : ""}`).join("\n")}

${plainText(tinkering)} Art: ${moodUrl} Sports: ${footballUrl} Music: ${sunoUrl}

## Work

${roles}

## Lenses

${Object.entries(resumeLenses).map(([label, keys]) => {
    const entries = keys
      .map((key) => reverseChronologicalWork().find((item) => `${item.years}-${item.org}` === key))
      .filter((item): item is ReturnType<typeof reverseChronologicalWork>[number] => Boolean(item));
    return `### ${plainText(label)}\n${entries.map((item) => `- ${item.years} - ${plainText(item.org)}`).join("\n")}`;
  }).join("\n\n")}

## Contact

${plainText(together)}

X: ${social.twitter}
LinkedIn: ${social.linkedin}
Email: available by request through the site.
`;
}

export function writeLlmsTxt() {
  const text = llmsTxt();
  const publicDir = resolve(root, "public");
  const wellKnownDir = resolve(publicDir, ".well-known");
  mkdirSync(wellKnownDir, { recursive: true });
  writeFileSync(resolve(publicDir, "llms.txt"), text);
  writeFileSync(resolve(wellKnownDir, "llms.txt"), text);
}
