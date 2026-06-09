const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, PageOrientation, HeadingLevel,
  BorderStyle, WidthType, ShadingType, VerticalAlign, PageNumber,
  PageBreak, LevelFormat,
} = require("docx");
const fs = require("fs");

// ─── Brand colours ───────────────────────────────────────────────────────────
const TEAL  = "00A4A1";
const ORANGE= "F06414";
const AMBER = "FFC000";
const GREEN = "375623";
const RED   = "C00000";
const GRAY  = "F2F2F2";
const LGRAY = "D9D9D9";
const WHITE = "FFFFFF";
const BLACK = "000000";
const LTEAL = "E6F7F7";
const LORANGE= "FFF0E6";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const b   = (text, sz=18, color=BLACK) => new TextRun({ text, bold: true, size: sz, color, font: "Arial" });
const r   = (text, sz=18, color=BLACK) => new TextRun({ text, size: sz, color, font: "Arial" });
const br  = () => new TextRun({ break: 1 });

function para(runs, opts={}) {
  return new Paragraph({ children: Array.isArray(runs) ? runs : [runs], font: "Arial", ...opts });
}
function heading(text, level, color=BLACK) {
  return new Paragraph({
    heading: level,
    children: [new TextRun({ text, bold: true, size: level===HeadingLevel.HEADING_1?28:22, color, font:"Arial" })],
    spacing: { before: 240, after: 120 },
  });
}
function spacer(sz=80) {
  return new Paragraph({ children: [new TextRun("")], spacing: { before: sz, after: 0 } });
}

const bdr = (color="AAAAAA", sz=4) => ({ style: BorderStyle.SINGLE, size: sz, color });
const cellBorders = (c="BBBBBB") => ({ top: bdr(c,4), bottom: bdr(c,4), left: bdr(c,4), right: bdr(c,4) });
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };
const MARG = { top: 80, bottom: 80, left: 120, right: 120 };

function hdrCell(text, w, bg=TEAL) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: cellBorders("999999"),
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: MARG,
    verticalAlign: VerticalAlign.CENTER,
    children: [para(b(text, 16, WHITE), { alignment: AlignmentType.CENTER })],
  });
}
function dataCell(runs, w, bg=WHITE, align=AlignmentType.LEFT) {
  const children = Array.isArray(runs) ? runs : [runs];
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: cellBorders(),
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: MARG,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children, alignment: align, spacing: { before: 0, after: 0 } })],
  });
}
function badge(text, fill=GREEN) {
  return new TextRun({ text: ` ${text} `, bold: true, size: 14, color: WHITE,
    highlight: fill===GREEN?"green":fill===RED?"red":"yellow", font: "Arial" });
}

// ─── Status pill via shaded small cell ───────────────────────────────────────
function statusCell(text, w, fill=GREEN) {
  const color = fill;
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: cellBorders(),
    shading: { fill: color, type: ShadingType.CLEAR },
    margins: MARG,
    verticalAlign: VerticalAlign.CENTER,
    children: [para(b(text, 15, WHITE), { alignment: AlignmentType.CENTER })],
  });
}

// ─── Title banner row (full width, no inner borders) ─────────────────────────
function titleBanner(text, totalW) {
  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: [totalW],
    rows: [new TableRow({ children: [
      new TableCell({
        width: { size: totalW, type: WidthType.DXA },
        borders: noBorders,
        shading: { fill: TEAL, type: ShadingType.CLEAR },
        margins: { top: 160, bottom: 160, left: 240, right: 240 },
        children: [
          para(b(text, 32, WHITE), { alignment: AlignmentType.CENTER }),
        ],
      }),
    ]})],
  });
}

function subBanner(text, totalW, fill=ORANGE) {
  return new Table({
    width: { size: totalW, type: WidthType.DXA },
    columnWidths: [totalW],
    rows: [new TableRow({ children: [
      new TableCell({
        width: { size: totalW, type: WidthType.DXA },
        borders: noBorders,
        shading: { fill, type: ShadingType.CLEAR },
        margins: { top: 100, bottom: 100, left: 240, right: 240 },
        children: [para(b(text, 22, WHITE))],
      }),
    ]})],
  });
}

// ─── Page: LANDSCAPE 11 × 8.5 ────────────────────────────────────────────────
// DXA: 1 inch = 1440.  Content width = 15840 - 2×720 = 14400
const PW = 15840, PH = 12240;
const LM = 720, RM = 720;
const CW = PW - LM - RM; // 14400

// ─── Content ─────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════════════
//  SECTION 1 — GDN DISPLAY TABLE (12 GIFs, READY TO DEPLOY)
// ══════════════════════════════════════════════════════════════════════════════
// Cols: File | Size | Channel | Use Case | Track | Budget | Priority | Agency Notes
// Widths summing to CW=14400
const GDNCOLS = [3000, 1200, 1800, 2000, 1600, 1200, 1200, 3400]; // sum=15400 → adjust
// Adjust: 3000+1200+1800+2000+1600+1200+1200+3400 = 15400.  Need 14400. Reduce proportionally.
// Scale factor: 14400/15400 = 0.935
const GC = [2800, 1120, 1680, 1870, 1490, 1120, 1120, 3200]; // sum=14400 ✓

const gdnHdr = new TableRow({ children: [
  hdrCell("File Name",           GC[0]),
  hdrCell("Size",                GC[1]),
  hdrCell("Channel",             GC[2]),
  hdrCell("Use Case / Audience", GC[3]),
  hdrCell("Track",               GC[4]),
  hdrCell("Budget Pool",         GC[5]),
  hdrCell("Priority",            GC[6]),
  hdrCell("Agency Notes",        GC[7]),
]});

function gdnRow(file, size, channel, audience, track, budget, priority, notes, rowBg=WHITE) {
  const priColor = priority==="Critical"?RED : priority==="Immediate"?ORANGE : "375623";
  return new TableRow({ children: [
    dataCell([b(file, 15)],                           GC[0], rowBg),
    dataCell([r(size, 16)],                           GC[1], rowBg, AlignmentType.CENTER),
    dataCell([r(channel, 16)],                        GC[2], rowBg),
    dataCell([r(audience, 16)],                       GC[3], rowBg),
    dataCell([r(track, 16)],                          GC[4], rowBg),
    dataCell([r(budget, 16)],                         GC[5], rowBg, AlignmentType.CENTER),
    dataCell([b(priority, 15, priColor)],             GC[6], rowBg, AlignmentType.CENTER),
    dataCell([r(notes, 15)],                          GC[7], rowBg),
  ]});
}

const gdnRows = [
  gdnRow("BATH_300x250_MediumRect.gif","300×250","GDN Display + PMax","Cold prospecting — new customers","Track A — Bath","$622","Critical","Most-served unit. Upload to both GDN & PMax responsive display. Price must dominate.", LTEAL),
  gdnRow("BATH_300x250_MediumRect.gif","300×250","GDN Retargeting","Site visitors who did not book","Track A — Bath","$622","Critical","Retargeting rotation. Agency: consider swapping headline to 'Still looking for a Boca groomer?' per brief retargeting variant.", LTEAL),
  gdnRow("BATH_300x600_HalfPage.gif","300×600","GDN Display + PMax","Cold prospecting — new customers","Track A — Bath","$622","High","Most visual space. Confirm 'Members enjoy unlimited baths monthly' secondary line is visible.", LTEAL),
  gdnRow("BATH_300x600_HalfPage.gif","300×600","GDN Retargeting","Site visitors who did not book","Track A — Bath","$622","High","Retargeting rotation with same GIF. Swap to softer retargeting headline variant if agency produces one.", LTEAL),
  gdnRow("BATH_160x600_Skyscraper.gif","160×600","GDN Display","Cold prospecting — new customers","Track A — Bath","$622","Standard","Not called out in brief spec list but standard GDN size; run as supplemental unit.", LTEAL),
  gdnRow("BATH_728x90_Leaderboard.gif","728×90","GDN Display + PMax","Cold prospecting — new customers","Track A — Bath","$622","High","⚠ Brief specifies 'no dog image' for this size (price + service + CTA only). Current version includes dog head — agency to confirm or request revision.", LTEAL),
  gdnRow("BATH_320x50_MobileLeader.gif","320×50","GDN Mobile","Cold prospecting — new customers","Track A — Bath","$622","High","5-word rule applies per brief: '$20 Off Bath & Brush — Book Now'.", LTEAL),
  gdnRow("BATH_300x50_MobileBanner.gif","300×50","GDN Mobile","Cold prospecting — new customers","Track A — Bath","$622","Standard","Supplemental mobile unit. Same copy constraints as 320×50.", LTEAL),

  gdnRow("GROOM_300x250_MediumRect.gif","300×250","GDN Display + PMax","Cold prospecting — new customers","Track B — Groom","$622","High","Confirm $56 is approved Boca groom price before going live. Run simultaneously with Bath 300×250.", LORANGE),
  gdnRow("GROOM_300x250_MediumRect.gif","300×250","GDN Retargeting","Site visitors who did not book","Track B — Groom","$622","High","Retargeting rotation for groom-interested visitors.", LORANGE),
  gdnRow("GROOM_300x600_HalfPage.gif","300×600","GDN Display + PMax","Cold prospecting — new customers","Track B — Groom","$622","High","Most room for copy. Include 'Members save even more — ask us how' secondary line where visible.", LORANGE),
  gdnRow("GROOM_160x600_Skyscraper.gif","160×600","GDN Display","Cold prospecting — new customers","Track B — Groom","$622","Standard","Supplemental unit.", LORANGE),
  gdnRow("GROOM_728x90_Leaderboard.gif","728×90","GDN Display + PMax","Cold prospecting — new customers","Track B — Groom","$622","High","Same note as Bath 728×90 — confirm agency preference on dog image inclusion.", LORANGE),
  gdnRow("GROOM_320x50_MobileLeader.gif","320×50","GDN Mobile","Cold prospecting — new customers","Track B — Groom","$622","High","Run in parallel with Bath mobile strip.", LORANGE),
  gdnRow("GROOM_300x50_MobileBanner.gif","300×50","GDN Mobile","Cold prospecting — new customers","Track B — Groom","$622","Standard","Supplemental mobile.", LORANGE),
];

const gdnTable = new Table({
  width: { size: CW, type: WidthType.DXA },
  columnWidths: GC,
  rows: [gdnHdr, ...gdnRows],
});

// ══════════════════════════════════════════════════════════════════════════════
//  SECTION 2 — DID GEOFENCING DEPLOYMENT TABLE
// ══════════════════════════════════════════════════════════════════════════════
const DC = [1600, 1600, 1800, 2000, 2200, 2200, 3000]; // sum=14400 ✓

const didHdr = new TableRow({ children: [
  hdrCell("DID Version",   DC[0], "C05000"),
  hdrCell("Headline",      DC[1], "C05000"),
  hdrCell("Track / Offer", DC[2], "C05000"),
  hdrCell("Geofence Tier", DC[3], "C05000"),
  hdrCell("Target Locations", DC[4], "C05000"),
  hdrCell("Schedule",      DC[5], "C05000"),
  hdrCell("Status / Notes",DC[6], "C05000"),
]});

function didRow(ver, headline, track, tier, locations, sched, notes, bg=WHITE) {
  return new TableRow({ children: [
    dataCell([b(ver, 16)],         DC[0], bg),
    dataCell([r(headline, 16)],    DC[1], bg),
    dataCell([r(track, 16)],       DC[2], bg),
    dataCell([r(tier, 16)],        DC[3], bg),
    dataCell([r(locations, 15)],   DC[4], bg),
    dataCell([r(sched, 15)],       DC[5], bg),
    dataCell([r(notes, 15)],       DC[6], bg),
  ]});
}

const didRows = [
  didRow("Version A\n(Dog Park)","Just Finished the Park?","Track A — Bath\n$20 OFF / BATH20","Tier 1 — Dog Parks\n(Highest Intent)","Spanish River Dog Park\nPatch Reef Dog Park\nMizner Bark Area\nSugar Sand Park","Max delivery\nWEEKENDS 7–10am\nDaypart if platform allows\nAlways-on remainder","⚠ ASSET NEEDED\nMobile portrait 9:16\n(e.g., 1080×1920)\nBrief: Sun-Kissed template","FFF0E6"),
  didRow("Version B\n(Competitor Bath)","A Boutique Option in Boca","Track A — Bath\n$20 OFF / BATH20","Tier 2 — Competitors\n(Conquest)","Woof Gang Bakery\n4400 N Federal Hwy\nPetSmart — confirm address\nPetco — confirm address","Always-on\nAll hours","⚠ ASSET NEEDED\nMobile portrait 9:16\n⚠ Confirm PetSmart & Petco\nexact Boca addresses","FFF0E6"),
  didRow("Version C\n(HOA Awareness)","$20 Off Bath & Brush","Track A — Bath\n$20 OFF / BATH20","Tier 4 — HOA / Country Clubs\n(Awareness)","Broken Sound Club\nBoca Pointe\nLoggers' Run\nBoca Woods CC\nGleneagles CC","Always-on\nAwareness flight","Use existing corporate asset\nAdjust geofences only\nper brief instruction","FFF0E6"),
  didRow("Version D\n(Groom Conquest)","Skip the Big Box","Track B — Groom\n$56 / Members Save More","Tier 2 — Competitors\n(Conquest — Groom)","PetSmart — confirm address\nPetco — confirm address","Always-on","⚠ ASSET NEEDED\nMobile portrait 9:16\n⚠ Confirm $56 Boca price\nbefore activating","FFE0CC"),
];

// Can't use LORANGE as a hex properly for last row bg — fix
const didRowsFixed = [
  didRow("Version A\n(Dog Park)","Just Finished the Park?","Track A — Bath\n$20 OFF / BATH20","Tier 1 — Dog Parks\n(Highest Intent)","Spanish River Dog Park\nPatch Reef Dog Park\nMizner Bark Area\nSugar Sand Park","Max delivery\nWEEKENDS 7–10am\nDaypart if platform allows","⚠ ASSET NEEDED\nMobile portrait 9:16\nBrief: Sun-Kissed template","FFF0E6"),
  didRow("Version B\n(Competitor Bath)","A Boutique Option in Boca","Track A — Bath\n$20 OFF / BATH20","Tier 2 — Competitors\n(Conquest)","Woof Gang Bakery\n4400 N Federal Hwy\nPetSmart — confirm address\nPetco — confirm address","Always-on\nAll hours","⚠ ASSET NEEDED\nMobile portrait 9:16\n⚠ Confirm PetSmart & Petco\nexact Boca addresses","FFF0E6"),
  didRow("Version C\n(HOA Awareness)","$20 Off Bath & Brush","Track A — Bath\n$20 OFF / BATH20","Tier 4 — HOA / Country Clubs\n(Awareness)","Broken Sound Club\nBoca Pointe\nLoggers' Run\nBoca Woods CC\nGleneagles CC","Always-on\nAwareness flight","Use existing corporate asset\nAdjust geofences only\nper brief instruction","FFF0E6"),
  didRow("Version D\n(Groom Conquest)","Skip the Big Box","Track B — Groom\n$56 / Members Save","Tier 2 — Competitors\n(Conquest — Groom)","PetSmart — confirm address\nPetco — confirm address","Always-on","⚠ ASSET NEEDED\nMobile portrait 9:16\n⚠ Confirm $56 Boca price","FFE0CC"),
];

const didTable = new Table({
  width: { size: CW, type: WidthType.DXA },
  columnWidths: DC,
  rows: [didHdr, ...didRowsFixed],
});

// ══════════════════════════════════════════════════════════════════════════════
//  SECTION 3 — ASSETS STILL NEEDED TABLE
// ══════════════════════════════════════════════════════════════════════════════
const NC = [2000, 1600, 1400, 1400, 1800, 6200]; // sum=14400 ✓

const neededHdr = new TableRow({ children: [
  hdrCell("Asset",        NC[0], RED),
  hdrCell("Size / Format",NC[1], RED),
  hdrCell("Track",        NC[2], RED),
  hdrCell("Priority",     NC[3], RED),
  hdrCell("Channel",      NC[4], RED),
  hdrCell("Copy Spec (from Brief)", NC[5], RED),
]});

function neededRow(asset, size, track, priority, channel, copy, bg="FFF2F2") {
  const pc = priority==="IMMEDIATE"?RED:"C05000";
  return new TableRow({ children: [
    dataCell([b(asset,16)],           NC[0], bg),
    dataCell([r(size,16)],            NC[1], bg, AlignmentType.CENTER),
    dataCell([r(track,16)],           NC[2], bg),
    dataCell([b(priority,15,pc)],     NC[3], bg, AlignmentType.CENTER),
    dataCell([r(channel,16)],         NC[4], bg),
    dataCell([r(copy,15)],            NC[5], bg),
  ]});
}

const neededTable = new Table({
  width: { size: CW, type: WidthType.DXA },
  columnWidths: NC,
  rows: [
    neededHdr,
    neededRow("DID Version A","1080×1920\n(9:16 mobile)","Track A — Bath","IMMEDIATE","DID Geofencing\n$800/mo","Headline: Just Finished the Park? | $20 OFF | BATH & BRUSH | BATH20\nCTA: Book Now | 561-418-3380 | Sun-Kissed template"),
    neededRow("DID Version B","1080×1920\n(9:16 mobile)","Track A — Bath","IMMEDIATE","DID Geofencing\n$800/mo","Headline: A Boutique Option in Boca | $20 OFF | BATH & BRUSH | BATH20\nCTA: Book Now | 561-418-3380 | Sun-Kissed template"),
    neededRow("DID Version C","1080×1920 or\nexisting asset","Track A — Bath","IMMEDIATE","DID Geofencing\n$800/mo","Use existing corporate $20 Off Bath & Brush asset as-is\nAdjust geofence targeting only — no new creative required"),
    neededRow("DID Version D","1080×1920\n(9:16 mobile)","Track B — Groom","IMMEDIATE","DID Geofencing\n$800/mo","Headline: Skip the Big Box | $56 | DOG GROOMING | Any Dog Up to 75LB\nNew Customers Only · Members Save More | CTA: 561-418-3380"),
    neededRow("Story / Vertical — Bath","1080×1920","Track A — Bath","IMMEDIATE","PMax / GDN","Adjust price on existing corporate Sun-Kissed template only\nOffer: $20 Off First Bath (confirm price first)"),
    neededRow("Story / Vertical — Groom","1080×1920","Track B — Groom","IMMEDIATE","PMax / GDN","Use/adjust existing corporate $56 Groom asset\nAdd: 'Members save even more — ask us how'"),
    neededRow("Desktop Billboard","970×250","Track A — Bath","Medium","GDN Display","Layout: dog left | headline center | CTA right\n$20 OFF FIRST BATH | BATH20 | Book Now → SDappointment.com"),
    neededRow("Retargeting Variant (Bath)","300×250\n+ 300×600","Track A — Bath","High","GDN Retargeting","Softer headline: 'Still looking for a Boca groomer?'\nSame price/CTA. Distinct creative from cold prospecting version.", "FFF9E6"),
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
//  SECTION 4 — PRE-LAUNCH APPROVAL CHECKLIST
// ══════════════════════════════════════════════════════════════════════════════
const CC = [3600, 5400, 2400, 3000]; // sum=14400 ✓

const checkHdr = new TableRow({ children: [
  hdrCell("Item",          CC[0], "444444"),
  hdrCell("Question",      CC[1], "444444"),
  hdrCell("Owner",         CC[2], "444444"),
  hdrCell("Blocks",        CC[3], "444444"),
]});

function checkRow(item, question, owner, blocks, bg=WHITE) {
  return new TableRow({ children: [
    dataCell([b(item,16)],          CC[0], bg),
    dataCell([r(question,16)],      CC[1], bg),
    dataCell([b(owner,15,"444444")],CC[2], bg),
    dataCell([r(blocks,15)],        CC[3], bg),
  ]});
}

const checkTable = new Table({
  width: { size: CW, type: WidthType.DXA },
  columnWidths: CC,
  rows: [
    checkHdr,
    checkRow("Bath offer price","Is $20 Off or $22 flat the approved Boca intro offer?","S&D Boca / Franchisee","ALL Bath GDN + DID units","FFF9E6"),
    checkRow("Groom offer price","Is $56 the confirmed Boca groom intro price?","S&D Boca / Franchisee","ALL Groom GDN + DID units","FFF9E6"),
    checkRow("PetSmart address","Confirm exact PetSmart Boca Raton location address for DID geofence build","Agency / Media Team","DID Version B, D",WHITE),
    checkRow("Petco address","Confirm exact Petco Boca Raton location address for DID geofence build","Agency / Media Team","DID Version B, D",WHITE),
    checkRow("Vet office list","Provide list of 5–8 target vet practices on Glades Rd, Palmetto Park Rd, Jog Rd corridors for DID Tier 3","S&D Boca","DID Tier 3 launch",WHITE),
    checkRow("DID dayparting","Does the DID platform support hour-of-day scheduling? (Required for Tier 1 dog park 7–10am delivery)","Agency / Media Team","DID Version A scheduling",WHITE),
    checkRow("Retargeting pixel","Is the conversion tracking / retargeting pixel live on the booking page at SDappointment.com?","Agency / Media Team","ALL GDN Retargeting units","FFF2F2"),
    checkRow("UTM tracking","Unique UTM parameters needed per channel for attribution (Display / DID / PMax / Retargeting)","Agency / Media Team","All performance reporting","FFF2F2"),
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
//  SECTION 5 — BUDGET & CHANNEL SUMMARY
// ══════════════════════════════════════════════════════════════════════════════
const BC = [2400, 1800, 2400, 2400, 5400]; // sum=14400 ✓

const budgetHdr = new TableRow({ children: [
  hdrCell("Channel",        BC[0], "2E4057"),
  hdrCell("Monthly Budget", BC[1], "2E4057"),
  hdrCell("Role",           BC[2], "2E4057"),
  hdrCell("Creative Assets", BC[3], "2E4057"),
  hdrCell("Notes",           BC[4], "2E4057"),
]});

function budRow(ch, budget, role, assets, notes, bg=WHITE) {
  return new TableRow({ children: [
    dataCell([b(ch,16)],          BC[0], bg),
    dataCell([b(budget,16,GREEN)],BC[1], bg, AlignmentType.CENTER),
    dataCell([r(role,16)],        BC[2], bg),
    dataCell([r(assets,15)],      BC[3], bg),
    dataCell([r(notes,15)],       BC[4], bg),
  ]});
}

const budgetTable = new Table({
  width: { size: CW, type: WidthType.DXA },
  columnWidths: BC,
  rows: [
    budgetHdr,
    budRow("Performance Max (PMax)","$1,500","Broad acquisition across all Google inventory","300×250, 728×90, 300×600 GIFs (responsive display assets)\n1080×1920 vertical (NEEDED)","Upload GIFs as responsive display assets. PMax auto-optimizes across Search, YouTube, Shopping, Display.", GRAY),
    budRow("Google Search (SEM)","$835","High-intent keyword capture","Text ads only — no display creative","No GIF assets used here. Agency manages keyword bidding.", WHITE),
    budRow("GDN Display + Retargeting","$622","Awareness + site-visitor re-engagement","ALL 12 GIFs ready\n+ Retargeting variant (NEEDED)","Split budget: ~70% cold / ~30% retargeting. See deployment table for per-size assignment.", GRAY),
    budRow("DID — Device ID Geofencing","$800","Location-triggered mobile display","4 DID versions (ALL NEEDED)\n9:16 mobile portrait format","None of the 12 GIFs are DID format. DID requires separate mobile portrait assets. See DID table.", WHITE),
    budRow("Local SEO","$200","Organic / map pack presence","No paid creative","Agency manages.", GRAY),
    budRow("Creative Production","$350","Asset design & development","Allocated for DID + Story/Vertical assets","Use for producing 6 remaining IMMEDIATE assets.", WHITE),
    budRow("TOTAL","$4,307","","","", LTEAL),
  ],
});

// ══════════════════════════════════════════════════════════════════════════════
//  ASSEMBLE DOCUMENT
// ══════════════════════════════════════════════════════════════════════════════
const sectionProps = {
  properties: {
    page: {
      size: { width: PW, height: PH, orientation: PageOrientation.LANDSCAPE },
      margin: { top: 720, right: RM, bottom: 720, left: LM },
    },
  },
  footers: {
    default: new Footer({
      children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({ text: "Splash and Dash Boca Raton — Creative Deployment Plan — Summer 2026   |   Page ", size: 16, color: "888888", font: "Arial" }),
          new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "888888", font: "Arial" }),
        ],
      })],
    }),
  },
};

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 18 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: TEAL }, paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: "444444" }, paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 1 } },
    ],
  },
  sections: [{
    ...sectionProps,
    children: [
      // ── TITLE ──
      titleBanner("SPLASH AND DASH GROOMERIE & BOUTIQUE — BOCA RATON", CW),
      spacer(40),
      new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [CW],
        rows: [new TableRow({ children: [new TableCell({
          width: { size: CW, type: WidthType.DXA },
          borders: noBorders, shading: { fill: GRAY, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 240, right: 240 },
          children: [
            para([b("Creative Deployment Plan  |  ", 22, "333333"), r("Display & DID Campaign — Summer 2026", 22, "555555")]),
            para([r("Prepared from Agency Brief dated May 28, 2026  •  Total Monthly Budget: $4,307", 16, "777777")]),
            para([r("12 animated GIF ad units built and ready  •  6 additional assets action required", 16, "777777")]),
          ],
        })]})],
      }),

      spacer(200),

      // ── SECTION 1 ──
      heading("1.  Google Display Network (GDN) — Ready to Deploy", HeadingLevel.HEADING_1),
      para([r("The following 12 animated GIFs are built to spec (all under 150KB, Ken Burns animation, looping under 15 seconds) and ready for upload.", 17, "333333")]),
      para([r("Row shading: ", 16, "555555"), r("BATH20 campaign (teal)", 16, "00A4A1"), r("  |  ", 16, "888888"), r("GRM20 campaign (orange)", 16, ORANGE)]),
      spacer(60),
      gdnTable,

      spacer(200),

      // ── SECTION 2 ──
      heading("2.  DID Geofencing — Action Required", HeadingLevel.HEADING_1),
      para([r("DID ads require mobile portrait (9:16) format. The 12 GIFs built are GDN display format and cannot be used for DID. Four DID versions are specified in the brief — assets must be produced before DID spend can activate.", 17, "333333")]),
      spacer(60),
      didTable,
      spacer(80),
      para([b("DID Tier 3 — Veterinary Offices & Pet Supply: ", 16, "555555"), r("Serve DID Version A (Bath) to 5–8 vet practices within 3 miles on Glades Rd, Palmetto Park Rd, and Jog Rd corridors. Address list to be provided by S&D Boca before activation.", 16, "555555")]),

      spacer(200),

      // ── SECTION 3 ──
      heading("3.  Assets Still Needed", HeadingLevel.HEADING_1),
      para([r("The items below are called out in the brief but not yet produced. IMMEDIATE items block campaign launch on PMax Story placements and the entire DID channel.", 17, "333333")]),
      spacer(60),
      neededTable,

      spacer(200),

      // ── SECTION 4 ──
      heading("4.  Budget & Channel Summary", HeadingLevel.HEADING_1),
      spacer(60),
      budgetTable,

      spacer(200),

      // ── SECTION 5 ──
      heading("5.  Pre-Launch Approval Checklist", HeadingLevel.HEADING_1),
      para([r("The following items must be confirmed before any ads go live. Price-dependent items (bath offer, groom price) affect all creative.", 17, "333333")]),
      spacer(60),
      checkTable,

      spacer(200),

      // ── COPY REFERENCE ──
      heading("6.  Approved Copy Reference — Quick Reference for Agency", HeadingLevel.HEADING_1),

      subBanner("Track A — Bath  |  Approved Headlines & CTAs", CW, TEAL),
      spacer(40),
      new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [CW/2, CW/2],
        rows: [
          new TableRow({ children: [
            new TableCell({ width: { size: CW/2, type: WidthType.DXA }, borders: cellBorders(), shading: { fill: LTEAL, type: ShadingType.CLEAR }, margins: MARG,
              children: [
                para(b("Approved Headlines", 17, TEAL)),
                para(r("• $20 Off Your First Bath", 16)),
                para(r("• First Bath Just $22 (alt. price point)", 16)),
                para(r("• Just Finished the Park? (DID dog parks)", 16)),
                para(r("• Still looking for a Boca groomer? (retargeting)", 16)),
                para(r("• Boca's Boutique Dog Groomer", 16)),
                para(r("• Not a Chain. Better.", 16)),
                para(r("• We Know Your Dog By Name.", 16)),
              ] }),
            new TableCell({ width: { size: CW/2, type: WidthType.DXA }, borders: cellBorders(), shading: { fill: LTEAL, type: ShadingType.CLEAR }, margins: MARG,
              children: [
                para(b("Approved CTAs & Always-Include", 17, TEAL)),
                para(r("• Book Now →  |  Book Your Visit →", 16)),
                para(r("• Grab Your $20 Off Bath →", 16)),
                para(r("• Book in 60 Seconds →", 16)),
                para(r("• Phone: 561-418-3380", 16)),
                para(r("• URL: splashanddashfordogs.com/boca-raton", 16)),
                para(b("Never Say:", 16, RED)),
                para(r("✗ Affordable  ✗ Unlimited grooming membership  ✗ Professional grooming services", 15, RED)),
              ] }),
          ]}),
        ],
      }),

      spacer(100),
      subBanner("Track B — Groom  |  Approved Copy Reference", CW, ORANGE),
      spacer(40),
      new Table({ width: { size: CW, type: WidthType.DXA }, columnWidths: [CW/2, CW/2],
        rows: [
          new TableRow({ children: [
            new TableCell({ width: { size: CW/2, type: WidthType.DXA }, borders: cellBorders(), shading: { fill: LORANGE, type: ShadingType.CLEAR }, margins: MARG,
              children: [
                para(b("Primary Offer Copy", 17, ORANGE)),
                para(r("• $56 Dog Grooming (confirm Boca price)", 16)),
                para(r("• Qualifier: Any Dog, Up to 75LB", 16)),
                para(r("• Disclaimer: New Customers Only", 16)),
                para(r("• Secondary: Members save even more — ask us how", 16)),
                para(r("• DID Headline: Skip the Big Box", 16)),
              ] }),
            new TableCell({ width: { size: CW/2, type: WidthType.DXA }, borders: cellBorders(), shading: { fill: LORANGE, type: ShadingType.CLEAR }, margins: MARG,
              children: [
                para(b("Approved Membership Language", 17, ORANGE)),
                para(r("✓ Members save on every groom", 16)),
                para(r("✓ Bath memberships — ask us how", 16)),
                para(r("✓ Members enjoy unlimited baths", 16)),
                para(b("Never Say:", 16, RED)),
                para(r("✗ Unlimited grooming membership  ✗ Unlimited grooming for members", 15, RED)),
                para(r("✗ Any implication that grooms are included in membership", 15, RED)),
              ] }),
          ]}),
        ],
      }),

      spacer(200),
      para([r("CONFIDENTIAL — FOR AGENCY USE ONLY  |  Splash and Dash Groomerie & Boutique — Boca Raton, FL  |  Summer 2026", 14, "AAAAAA")], { alignment: AlignmentType.CENTER }),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/home/user/SD_Boca_Creative_Deployment_Plan_Summer2026.docx", buf);
  console.log("Done!");
}).catch(e => { console.error(e); process.exit(1); });
