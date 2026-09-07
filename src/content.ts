export const profile = {
  name: "Jeza Mancenido",
  description:
    "Jeza Mancenido builds two-sided marketplaces and developer platforms before the playbook exists. Product-market fit, APIs and SDKs, pricing and packaging, and partner distribution. Based in Los Angeles.",
  url: "https://www.jezamancenido.com/",
  photo: "/assets/jeza-mancenido-1.jpg",
  photoAlt: "Portrait of Jeza Mancenido",
  photos: {
    artsy: "/assets/jeza-mancenido-1.jpg",
    twitter: "/assets/jeza-mancenido-2.jpg",
    work: "/assets/jeza-mancenido-3.jpg",
  },
};

export const social = {
  linkedin: "https://www.linkedin.com/in/jezaannmancenido",
  twitter: "https://twitter.com/jezamancenido",
  mailUser: ["jeza", "ann", "mancenido"] as const,
  mailDomain: ["gmail", "com"] as const,
};

export function mailAddress() {
  return `${social.mailUser.join(".")}@${social.mailDomain.join(".")}`;
}

export function mailComposeHref() {
  return `mailto:${mailAddress()}?subject=${encodeURIComponent("let's work together")}`;
}

export const about = [
  "I build new products, marketplaces and developer platforms before the playbook exists.",
  "I care about the “so what?” of technology. What does it actually help people do? Does it make us more capable, more creative, more connected?",
  "Currently based in Los Angeles after a decade as a New Yorker. Forever Aussie and Knicks fan.",
];

export const together =
  "If you’re building something ambitious in LA, SF or NYC, say hello.";

export const now = [
  "Building a two-sided consumer marketplace from 0→1.",
  "Writing about AI, agents and the future of work.",
  "Studying philosophy, psychology and technological change.",
  "Hosting dinners and book clubs in LA.",
];
export type WorkCategory = "gtm" | "ai" | "platforms" | "partnerships" | "scale" | "earlier";
export type WorkRole = {
  years: string;
  org: string;
  summary: string;
  category: WorkCategory;
  problem?: boolean;
  source?: string;
  sourceLabel?: string;
};

export const workCategories: { id: WorkCategory; label: string }[] = [
  { id: "gtm", label: "Finding product-market fit" },
  { id: "partnerships", label: "Partnerships, distribution and new markets" },
  { id: "platforms", label: "Commercialization and developer platforms" },
  { id: "scale", label: "Operating through sudden scale" },
];
export const work: WorkRole[] = [
  {
    years: "2026-present",
    org: "Consumer marketplace",
    category: "gtm",
    problem: true,
    summary:
      "Owning product-market fit on a two-sided marketplace: customer insight, distribution, partnerships and trust.",
  },
  {
    years: "2025",
    org: "Meta AI",
    category: "ai",
    summary:
      "Helped post-training research operations scale across product, engineering, legal and global operations.",
  },
  {
    years: "2023",
    org: "Google ChromeOS",
    category: "platforms",
    problem: false,
    summary: "Reset product direction on a developer-experience portfolio.",
  },
  {
    years: "2019-2022",
    org: "Google Meet",
    category: "scale",
    problem: true,
    summary:
      "Set the operating structure for product, engineering and go-to-market when daily usage exploded overnight.",
    source:
      "https://blog.google/products-and-platforms/products/workspace/bringing-google-meet-to-more-people/",
    sourceLabel: "Bringing Google Meet to more people",
  },
  {
    years: "2019",
    org: "Google Meet hardware",
    category: "platforms",
    problem: false,
    summary: "Strategy and operations for a hardware meeting product.",
  },
  {
    years: "2019",
    org: "Google Jamboard",
    category: "platforms",
    problem: false,
    summary:
      "Strategy and operations for a hardware whiteboard, including running release engineering for Android on device. The hardware was later wound down.",
  },
  {
    years: "2016-2018",
    org: "Google Maps Platform",
    category: "platforms",
    problem: true,
    summary:
      "Turned a widely used Maps API and SDK into a commercial platform: pricing and packaging, pay-as-you-go, partner lifecycle and public-impact access.",
    source: "https://mapsplatform.google.com/resources/blog/introducing-google-maps-platform/",
    sourceLabel: "Introducing Google Maps Platform",
  },
  {
    years: "2014-2015",
    org: "Google Maps Platform",
    category: "platforms",
    problem: true,
    summary:
      "Got enterprises and resellers onto the APIs and SDKs through trusted testing, technical guides and self-serve support.",
  },
  {
    years: "2010-2013",
    org: "Google Cloud · Asia Pacific",
    category: "partnerships",
    problem: true,
    summary:
      "Opened partner-led markets across APAC with reseller programs and partner distribution. Revenue grew more than 300% in six months.",
  },
  {
    years: "2008-2010",
    org: "PwC Australia",
    category: "earlier",
    summary: "M&A strategy and post-merger integration after a large Australian health acquisition.",
  },
];
export const questions = [
  "What makes a new tool useful enough to become part of someone’s life?",
  "If AI can make fifty versions of anything, what makes one worth making?",
  "How do you build a marketplace where people find things they trust and builders find customers?",
  "How do you charge for the value a product creates without making it harder to access?",
  "How do you build a team that can move quickly and still question whether it is solving the right problem?",
  "How do we know an AI agent is making someone more capable?",
];
export const emojiSet = ["✨", "🌴", "👩🏽‍💻"] as const;

export function startYear(item: WorkRole) {
  const match = item.years.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

export function endYear(item: WorkRole) {
  if (item.years.includes("present")) return 9999;
  const years = item.years.match(/\d{4}/g);
  return years ? Number(years[years.length - 1]) : 0;
}

export function problemWorkGroups() {
  return workCategories
    .map((category) => ({
      ...category,
      items: work.filter(
        (item) =>
          item.category === category.id &&
          item.problem &&
          !item.org.toLowerCase().includes("chrome"),
      ),
    }))
    .filter((group) => group.items.length > 0);
}

export function reverseChronologicalWork() {
  return [...work].sort((a, b) => endYear(b) - endYear(a) || startYear(b) - startYear(a));
}
