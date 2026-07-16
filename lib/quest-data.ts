import type { QuestDay, BadgeDef, LevelDef } from "@/types/quest";

let idc = 0;
const uid = () => `t${++idc}`;
function t(text: string, points: number, badgeTag?: import("@/types/quest").BadgeTag) {
  return { id: uid(), text, points, badgeTag };
}

export const QUEST_DAYS: QuestDay[] = [
  {
    key: "before", label: "Before Starting", emoji: "☀️",
    goal: "Launch sequence — every weekday",
    sections: [
      { id: "launch", title: "Get Ready", tasks: [
        t("Wake up on time", 1), t("Get dressed", 1), t("Eat breakfast", 1), t("Make bed", 1),
        t("Brush teeth", 1), t("Put phone on Do Not Disturb", 1), t("Close YouTube", 1),
        t("Close Minecraft", 1), t("Close Discord", 1),
        t("Open only: Gmail, LinkedIn, Resume, Chrome, Excel Tracker", 1),
        t("Start a 60-minute timer", 2),
      ] },
    ],
  },
  {
    key: "monday", label: "Monday", emoji: "💼", goal: "Full-Time Tech Career Day",
    sections: [
      { id: "email", title: "Step 1 — Check Email (10 min)", tasks: [
        t("Read email", 1), t("Respond to any recruiters", 3), t("Respond to LinkedIn messages", 2), t("Check voicemail", 1),
      ] },
      { id: "research", title: "Step 2 — Company Research (45 min)", tasks: [
        t("Visit careers page for 5 target companies", 2),
        t("Search entry-level titles (SWE I, Associate SWE, QA, IT Support, AI)", 1),
        t("Save every interesting job", 2),
      ] },
      { id: "apply", title: "Step 3 — Apply (Goal: 2 applications)", tasks: [
        t("Application #1 submitted", 5, "application"),
        t("Application #2 submitted", 5, "application"),
      ] },
      { id: "network", title: "Step 4 — Networking", tasks: [
        t("Send 5 LinkedIn connection requests", 2, "connection"),
        t("Send 3 personalized messages", 3),
        t("Request 1 informational interview", 10, "interview"),
      ] },
      { id: "neuro", title: "Step 5 — Neurodiverse Employers", tasks: [
        t("Visit Mentra, Neurodiversity Career Connector, Hire Autism, Specialisterne, Spectrum Careers", 1),
        t("Apply to at least ONE position", 5, "application"),
      ] },
      { id: "boards", title: "Step 6 — Job Boards (30 min)", tasks: [
        t("Check LinkedIn Jobs, Indeed, Handshake, Dice, Built In, Wellfound", 1),
        t("Apply to anything appropriate", 5, "application"),
      ] },
      { id: "tracker", title: "Step 7 — Update Tracker", tasks: [
        t("Log company, date, position, status, follow-up date", 2),
      ] },
    ],
  },
  {
    key: "tuesday", label: "Tuesday", emoji: "🛍️", goal: "Part-Time Job Day",
    sections: [
      { id: "indeed", title: "Indeed Search", tasks: [
        t("Search retail, grocery, pet care, reception, customer service, IT help desk, library", 1),
        t("Apply to 5 part-time jobs", 4),
      ] },
      { id: "walkin", title: "Walk-In Applications (Goal: visit 10 stores)", tasks: [
        t("Visit Target, Walmart, Publix, PetSmart, Petco, Best Buy, Staples, Home Depot, Lowe's, local shops", 1),
        t("Ask: “Hi, I’m looking for a part-time position. Are you hiring?”", 1),
        t("Complete a walk-in application", 5, "walkin"),
      ] },
      { id: "tracker2", title: "Update Tracker", tasks: [
        t("Record applications, managers spoken with, follow-up dates", 2),
      ] },
    ],
  },
  {
    key: "wednesday", label: "Wednesday", emoji: "📚", goal: "Skill Building Day",
    sections: [
      { id: "cert", title: "Certifications — Choose ONE", tasks: [
        t("Google IT Support / Cybersecurity, AWS, Azure, CompTIA, IBM AI, Python, or SQL", 1),
        t("Spend 90 minutes studying", 8, "certification"),
      ] },
      { id: "volunteer", title: "Volunteer Search", tasks: [
        t("Search shelters, libraries, schools, museums, food banks, nonprofits", 1),
        t("Contact 2 organizations", 5, "volunteer"),
      ] },
      { id: "portfolio", title: "Portfolio (60 min)", tasks: [
        t("Update GitHub", 2), t("Update Resume", 2), t("Update LinkedIn", 2),
      ] },
    ],
  },
  {
    key: "thursday", label: "Thursday", emoji: "🔁", goal: "Repeat Monday — fresh companies, fresh contacts",
    sections: [
      { id: "apply2", title: "Applications (Goal: 2 more)", tasks: [
        t("Application #1 submitted", 5, "application"),
        t("Application #2 submitted", 5, "application"),
      ] },
      { id: "network2", title: "Networking", tasks: [
        t("Send 5 LinkedIn connection requests", 2, "connection"),
        t("Research 5 more companies", 2),
      ] },
    ],
  },
  {
    key: "friday", label: "Friday", emoji: "🔁", goal: "Repeat Tuesday — different shopping center",
    sections: [
      { id: "parttime2", title: "Part-Time & Walk-Ins", tasks: [
        t("Apply for 5 more part-time jobs", 4),
        t("Visit 10 new stores", 5, "walkin"),
      ] },
    ],
  },
];

export const LEVELS: LevelDef[] = [
  { level: 1, emoji: "🟢", name: "Rookie Recruiter", minXP: 0 },
  { level: 2, emoji: "🔵", name: "Job Hunter", minXP: 25 },
  { level: 3, emoji: "🟣", name: "Networking Ninja", minXP: 50 },
  { level: 4, emoji: "🟠", name: "Application Ace", minXP: 75 },
  { level: 5, emoji: "🟡", name: "Interview Champion", minXP: 100 },
  { level: 6, emoji: "🏆", name: "Offer Boss", minXP: 125 },
];

export const BADGES: BadgeDef[] = [
  { id: "first-blood", emoji: "🥇", name: "First Blood", description: "Submit your first application",
    check: (c) => (c.application ?? 0) >= 1 },
  { id: "networker", emoji: "🤝", name: "Networker", description: "Send 10 total LinkedIn connections",
    check: (c) => (c.connection ?? 0) >= 10 },
  { id: "foot-in-door", emoji: "🚪", name: "Foot in the Door", description: "Complete a walk-in application",
    check: (c) => (c.walkin ?? 0) >= 1 },
  { id: "certified", emoji: "📜", name: "Certified", description: "Finish a certification study session",
    check: (c) => (c.certification ?? 0) >= 1 },
  { id: "interview-unlocked", emoji: "🎤", name: "Interview Unlocked", description: "Land your first interview",
    check: (c) => (c.interview ?? 0) >= 1 },
  { id: "community-helper", emoji: "💚", name: "Community Helper", description: "Contact 2 volunteer organizations",
    check: (c) => (c.volunteer ?? 0) >= 2 },
  { id: "streak-5", emoji: "🔥", name: "5-Day Streak", description: "Complete Before Starting 5 days running",
    check: (_c, streak) => streak >= 5 },
];
