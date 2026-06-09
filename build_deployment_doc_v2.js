const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType,
  ImageRun, PageOrientation, convertInchesToTwip, VerticalAlign,
  PageBreak, TableLayoutType
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─── Brand Colors ─────────────────────────────────────────────────────────────
const TEAL    = "2B7A78";
const ORANGE  = "F4631E";
const LGRAY   = "F5F5F5";
const DGRAY   = "4A4A4A";
const WHITE   = "FFFFFF";
const LTEAL   = "D6EEEC";
const LORANGE = "FFE0CC";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function px(n) { return Math.round(n * 914.4); } // pixels at 96dpi → EMUs (not needed for DXA)
function pt(n) { return n * 20; }

function cell(text, opts = {}) {
  const {
    bold = false, color = DGRAY, bg = WHITE, size = 18, align = AlignmentType.LEFT,
    colSpan = 1, vAlign = VerticalAlign.CENTER, borders = true, italics = false
  } = opts;
  return new TableCell({
    columnSpan: colSpan,
    verticalAlign: vAlign,
    shading: { type: ShadingType.CLEAR, fill: bg, color: "auto" },
    borders: borders ? undefined : {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    children: [new Paragraph({
      alignment: align,
      spacing: { before: 40, after: 40 },
      children: [new TextRun({ text: String(text), bold, italics, color, size, font: "Calibri" })]
    })]
  });
}

function hCell(text, opts = {}) {
  return cell(text, { bold: true, color: WHITE, bg: TEAL, size: 18, ...opts });
}

function para(text, opts = {}) {
  const {
    bold = false, size = 20, color = DGRAY, align = AlignmentType.LEFT,
    spaceBefore = 0, spaceAfter = 80, italics = false, heading = null
  } = opts;
  const p = new Paragraph({
    heading: heading || undefined,
    alignment: align,
    spacing: { before: spaceBefore, after: spaceAfter },
    children: [new TextRun({ text, bold, italics, color, size, font: "Calibri" })]
  });
  return p;
}

function sectionHeader(text) {
  return new Paragraph({
    spacing: { before: 240, after: 120 },
    children: [{
      ...new TextRun({ text, bold: true, color: WHITE, size: 26, font: "Calibri" }),
    }],
    shading: { type: ShadingType.CLEAR, fill: TEAL, color: "auto" },
    indent: { left: 120, right: 120 },
  });
}

function sectionTitle(text) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: TEAL } },
    children: [new TextRun({ text, bold: true, color: TEAL, size: 28, font: "Calibri" })]
  });
}

function subTitle(text) {
  return new Paragraph({
    spacing: { before: 140, after: 60 },
    children: [new TextRun({ text, bold: true, color: ORANGE, size: 22, font: "Calibri" })]
  });
}

// ─── Image helper ─────────────────────────────────────────────────────────────
function imgRun(file, w, h, altText) {
  const fullPath = path.join('/home/user/thumbs', file);
  return new ImageRun({
    type: 'png',
    data: fs.readFileSync(fullPath),
    transformation: { width: w, height: h },
    altText: { title: altText, description: altText, name: altText }
  });
}

function imgCell(file, w, h, altText, caption) {
  return new TableCell({
    verticalAlign: VerticalAlign.CENTER,
    shading: { type: ShadingType.CLEAR, fill: WHITE, color: "auto" },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 40 },
        children: [imgRun(file, w, h, altText)]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 60 },
        children: [new TextRun({ text: caption, bold: false, color: DGRAY, size: 16, font: "Calibri" })]
      })
    ]
  });
}

// ─── PAGE 1: Title & Overview ─────────────────────────────────────────────────
const page1 = [
  // Title block
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 40 },
    children: [new TextRun({ text: "SPLASH AND DASH BOCA RATON", bold: true, color: TEAL, size: 52, font: "Calibri" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 40 },
    children: [new TextRun({ text: "Creative Deployment Plan — Summer 2026", bold: true, color: ORANGE, size: 36, font: "Calibri" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 },
    children: [new TextRun({ text: "Google Display Network (GDN) + DID Geofencing  |  June – August 2026", color: DGRAY, size: 20, font: "Calibri" })]
  }),

  // Confirmed Pricing Banner
  new Table({
    width: { size: 14400, type: WidthType.DXA },
    columnWidths: [14400],
    rows: [new TableRow({ children: [
      new TableCell({
        shading: { type: ShadingType.CLEAR, fill: ORANGE, color: "auto" },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
          children: [new TextRun({ text: "✅  CONFIRMED OFFER: $20 OFF First Visit — Bath (BATH20) & Groom (GRM20)", bold: true, color: WHITE, size: 24, font: "Calibri" })]
        })]
      })
    ]})]
  }),

  para("", { spaceAfter: 100 }),

  // Channel summary table
  sectionTitle("Campaign Overview"),
  para("", { spaceAfter: 60 }),

  new Table({
    width: { size: 14400, type: WidthType.DXA },
    columnWidths: [3200, 2800, 2400, 2400, 3600],
    rows: [
      new TableRow({ children: [
        hCell("Channel"),
        hCell("Audience"),
        hCell("Budget/Mo"),
        hCell("Offer"),
        hCell("Status"),
      ]}),
      new TableRow({ children: [
        cell("Google Display Network", { bold: true }),
        cell("Retargeting + Prospecting"),
        cell("$850"),
        cell("$20 OFF (BATH20 / GRM20)"),
        cell("✅ LIVE — All 12 assets ready", { color: "2E7D32", bold: true }),
      ]}),
      new TableRow({ children: [
        cell("DID Geofencing", { bold: true, bg: LGRAY }),
        cell("Dog park / competitor visitors", { bg: LGRAY }),
        cell("$600", { bg: LGRAY }),
        cell("$20 OFF (BATH20 / GRM20)", { bg: LGRAY }),
        cell("✅ LIVE — All 4 assets ready", { color: "2E7D32", bold: true, bg: LGRAY }),
      ]}),
      new TableRow({ children: [
        cell("Pmax", { bold: true }),
        cell("Broad audience signals"),
        cell("$1,500"),
        cell("Standard"),
        cell("Active"),
      ]}),
      new TableRow({ children: [
        cell("SEM", { bold: true, bg: LGRAY }),
        cell("Search intent (grooming KWs)", { bg: LGRAY }),
        cell("$900", { bg: LGRAY }),
        cell("Standard", { bg: LGRAY }),
        cell("Active", { bg: LGRAY }),
      ]}),
    ]
  }),

  para("", { spaceAfter: 120 }),

  // Timeline table
  sectionTitle("Deployment Timeline"),
  para("", { spaceAfter: 60 }),

  new Table({
    width: { size: 14400, type: WidthType.DXA },
    columnWidths: [2200, 4000, 4000, 4200],
    rows: [
      new TableRow({ children: [
        hCell("Phase"),
        hCell("Dates"),
        hCell("Focus"),
        hCell("Key Assets"),
      ]}),
      new TableRow({ children: [
        cell("1 – Launch", { bold: true, bg: LTEAL }),
        cell("June 1 – June 30", { bg: LTEAL }),
        cell("Awareness + First-Visit Offer", { bg: LTEAL }),
        cell("GDN 300×250, DID Version A & B", { bg: LTEAL }),
      ]}),
      new TableRow({ children: [
        cell("2 – Peak Summer", { bold: true }),
        cell("July 1 – July 31"),
        cell("Grooming Upsell + Retargeting"),
        cell("GDN 300×600, 728×90, DID Version C & D"),
      ]}),
      new TableRow({ children: [
        cell("3 – Back to School", { bold: true, bg: LTEAL }),
        cell("Aug 1 – Aug 31", { bg: LTEAL }),
        cell("Retention + Membership Promo", { bg: LTEAL }),
        cell("Full rotation, all sizes", { bg: LTEAL }),
      ]}),
    ]
  }),
];

// ─── PAGE 2: GDN Creative Gallery ─────────────────────────────────────────────
const gdnAdData = [
  // Bath row
  { file: "gdn_bath_300x250.png", w: 130, h: 108, label: "Bath 300×250", priority: "Critical" },
  { file: "gdn_bath_300x600.png", w: 70, h: 140, label: "Bath 300×600", priority: "High" },
  { file: "gdn_bath_160x600.png", w: 40, h: 150, label: "Bath 160×600", priority: "Standard" },
  { file: "gdn_bath_728x90.png",  w: 150, h: 19,  label: "Bath 728×90",  priority: "High" },
  { file: "gdn_bath_320x50.png",  w: 150, h: 23,  label: "Bath 320×50",  priority: "High" },
  { file: "gdn_bath_300x50.png",  w: 150, h: 25,  label: "Bath 300×50",  priority: "Standard" },
  // Groom row
  { file: "gdn_groom_300x250.png", w: 130, h: 108, label: "Groom 300×250", priority: "Critical" },
  { file: "gdn_groom_300x600.png", w: 70,  h: 140, label: "Groom 300×600", priority: "High" },
  { file: "gdn_groom_160x600.png", w: 40,  h: 150, label: "Groom 160×600", priority: "Standard" },
  { file: "gdn_groom_728x90.png",  w: 150, h: 19,  label: "Groom 728×90",  priority: "High" },
  { file: "gdn_groom_320x50.png",  w: 150, h: 23,  label: "Groom 320×50",  priority: "High" },
  { file: "gdn_groom_300x50.png",  w: 150, h: 25,  label: "Groom 300×50",  priority: "Standard" },
];

function makeGdnGalleryRow(ads) {
  // 6 cells × 2400 DXA = 14400
  return new TableRow({
    children: ads.map(ad => imgCell(ad.file, ad.w, ad.h, ad.label, ad.label))
  });
}

const gdnTableFull = new Table({
  width: { size: 14400, type: WidthType.DXA },
  columnWidths: [2400, 2400, 2400, 2400, 2400, 2400],
  rows: [
    new TableRow({ children: [
      hCell("Bath 300×250\n(Critical)", { align: AlignmentType.CENTER }),
      hCell("Bath 300×600\n(High)", { align: AlignmentType.CENTER }),
      hCell("Bath 160×600\n(Standard)", { align: AlignmentType.CENTER }),
      hCell("Bath 728×90\n(High)", { align: AlignmentType.CENTER }),
      hCell("Bath 320×50\n(High)", { align: AlignmentType.CENTER }),
      hCell("Bath 300×50\n(Standard)", { align: AlignmentType.CENTER }),
    ]}),
    makeGdnGalleryRow(gdnAdData.slice(0, 6)),
    new TableRow({ children: [
      hCell("Groom 300×250\n(Critical)", { align: AlignmentType.CENTER, bg: "1E5F5D" }),
      hCell("Groom 300×600\n(High)", { align: AlignmentType.CENTER, bg: "1E5F5D" }),
      hCell("Groom 160×600\n(Standard)", { align: AlignmentType.CENTER, bg: "1E5F5D" }),
      hCell("Groom 728×90\n(High)", { align: AlignmentType.CENTER, bg: "1E5F5D" }),
      hCell("Groom 320×50\n(High)", { align: AlignmentType.CENTER, bg: "1E5F5D" }),
      hCell("Groom 300×50\n(Standard)", { align: AlignmentType.CENTER, bg: "1E5F5D" }),
    ]}),
    makeGdnGalleryRow(gdnAdData.slice(6, 12)),
  ]
});

const page2 = [
  new Paragraph({ children: [new PageBreak()] }),
  sectionTitle("GDN Display Ad Creative Gallery — All 12 Units"),
  para("All units delivered as animated GIF with Ken Burns zoom effect. Loop: infinite. File size: <150KB each.", { spaceAfter: 100, size: 18, italics: true }),
  gdnTableFull,
  para("", { spaceAfter: 140 }),

  // GDN Deployment Table
  sectionTitle("GDN Display — Deployment & Trafficking"),
  para("", { spaceAfter: 60 }),

  new Table({
    width: { size: 14400, type: WidthType.DXA },
    columnWidths: [1600, 1400, 1400, 1600, 2000, 2400, 4000],
    rows: [
      new TableRow({ children: [
        hCell("Ad Unit"),
        hCell("Dims"),
        hCell("Priority"),
        hCell("Campaign"),
        hCell("Offer / Code"),
        hCell("Flight"),
        hCell("Notes"),
      ]}),
      // Bath units
      ...[
        ["Bath Rect", "300×250", "Critical", "Retargeting", "$20 OFF / BATH20", "June–Aug", "Above-fold placement, highest volume"],
        ["Bath Half Page", "300×600", "High", "Retargeting", "$20 OFF / BATH20", "June–Aug", "Premium inventory; high visibility"],
        ["Bath Leaderboard", "728×90", "High", "Prospecting", "$20 OFF / BATH20", "June–Aug", "Desktop top-of-page"],
        ["Bath Skyscraper", "160×600", "Standard", "Prospecting", "$20 OFF / BATH20", "July–Aug", "Sidebar; desktop only"],
        ["Bath Mobile Leader", "320×50", "High", "Mobile", "$20 OFF / BATH20", "June–Aug", "Mobile top banner"],
        ["Bath Mobile Strip", "300×50", "Standard", "Mobile", "$20 OFF / BATH20", "July–Aug", "Secondary mobile placement"],
      ].map((r, i) => new TableRow({ children: r.map(t => cell(t, { bg: i % 2 === 0 ? WHITE : LGRAY })) })),
      // Groom units
      ...[
        ["Groom Rect", "300×250", "Critical", "Retargeting", "$20 OFF / GRM20", "June–Aug", "Mirror of bath; test alternate creative"],
        ["Groom Half Page", "300×600", "High", "Retargeting", "$20 OFF / GRM20", "June–Aug", "Swap with bath creative mid-flight"],
        ["Groom Leaderboard", "728×90", "High", "Prospecting", "$20 OFF / GRM20", "June–Aug", "A/B rotation with Bath Leaderboard"],
        ["Groom Skyscraper", "160×600", "Standard", "Prospecting", "$20 OFF / GRM20", "July–Aug", "Sidebar; desktop only"],
        ["Groom Mobile Leader", "320×50", "High", "Mobile", "$20 OFF / GRM20", "June–Aug", "Mobile top banner"],
        ["Groom Mobile Strip", "300×50", "Standard", "Mobile", "$20 OFF / GRM20", "July–Aug", "Secondary mobile"],
      ].map((r, i) => new TableRow({ children: r.map(t => cell(t, { bg: i % 2 === 0 ? LORANGE : WHITE, color: DGRAY })) })),
    ]
  }),
];

// ─── PAGE 3: DID Creative Gallery ─────────────────────────────────────────────
const didMeta = [
  { file: "did_A.png", label: "Version A", sub: "Dog Park Targeting", offer: "Bath $20 OFF", code: "BATH20", audience: "Dog park visitors (geo-fence)", notes: "Radius: 0.25mi around top 5 Boca dog parks" },
  { file: "did_B.png", label: "Version B", sub: "Competitor Conquest (Bath)", offer: "Bath $20 OFF", code: "BATH20", audience: "Visitors at competitor groomer locations", notes: "Conquest: PetSmart, Petco, local groomers" },
  { file: "did_C.png", label: "Version C", sub: "HOA / Neighborhood Awareness", offer: "Bath $20 OFF", code: "BATH20", audience: "Luxury HOA residents in zip 33496/33433", notes: "Awareness play; longer dwell time targeting" },
  { file: "did_D.png", label: "Version D", sub: "Competitor Conquest (Groom)", offer: "Groom $20 OFF", code: "GRM20", audience: "Visitors at competitor groomer locations", notes: "Upsell to full groom service" },
];

function makeDIDCell(meta) {
  return new TableCell({
    verticalAlign: VerticalAlign.TOP,
    shading: { type: ShadingType.CLEAR, fill: WHITE, color: "auto" },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: TEAL },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: TEAL },
      left: { style: BorderStyle.SINGLE, size: 4, color: TEAL },
      right: { style: BorderStyle.SINGLE, size: 4, color: TEAL },
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 80, after: 60 },
        children: [new TextRun({ text: meta.label, bold: true, color: TEAL, size: 22, font: "Calibri" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: meta.sub, color: DGRAY, size: 17, font: "Calibri" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [imgRun(meta.file, 200, 356, meta.label)]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 40 },
        children: [new TextRun({ text: `Offer: ${meta.offer}`, bold: true, color: ORANGE, size: 18, font: "Calibri" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 40 },
        children: [new TextRun({ text: `Code: ${meta.code}`, bold: true, color: TEAL, size: 18, font: "Calibri" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: `Audience: ${meta.audience}`, color: DGRAY, size: 16, font: "Calibri" })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [new TextRun({ text: meta.notes, italics: true, color: "666666", size: 15, font: "Calibri" })]
      }),
    ]
  });
}

const page3 = [
  new Paragraph({ children: [new PageBreak()] }),
  sectionTitle("DID Geofencing Creative Gallery — All 4 Mobile Units"),
  para("Format: JPEG, 1080×1920 (9:16 portrait). Delivered to DSP for mobile device ID targeting. Status: ✅ All 4 Ready.", { spaceAfter: 100, size: 18, italics: true }),

  new Table({
    width: { size: 14400, type: WidthType.DXA },
    columnWidths: [3600, 3600, 3600, 3600],
    rows: [new TableRow({ children: didMeta.map(makeDIDCell) })]
  }),

  para("", { spaceAfter: 120 }),

  // DID Deployment Table
  sectionTitle("DID Geofencing — Deployment & Trafficking"),
  para("", { spaceAfter: 60 }),

  new Table({
    width: { size: 14400, type: WidthType.DXA },
    columnWidths: [1400, 1200, 1800, 2000, 1800, 2200, 4000],
    rows: [
      new TableRow({ children: [
        hCell("Version"),
        hCell("Format"),
        hCell("Audience Segment"),
        hCell("Geo Trigger"),
        hCell("Offer / Code"),
        hCell("Flight"),
        hCell("Notes"),
      ]}),
      ...[
        ["A – Dog Park", "1080×1920 JPEG", "Dog park visitors", "Top 5 Boca parks, 0.25mi radius", "$20 OFF / BATH20", "June–Aug", "Primary awareness; high dog owner density"],
        ["B – Conquest Bath", "1080×1920 JPEG", "Competitor visitors (bath)", "PetSmart, Petco, local groomers", "$20 OFF / BATH20", "June–Aug", "Intercept at point of competitor intent"],
        ["C – HOA Awareness", "1080×1920 JPEG", "Luxury HOA residents", "Zip 33496, 33433, 33428", "$20 OFF / BATH20", "July–Aug", "Brand awareness; longer dwell time"],
        ["D – Conquest Groom", "1080×1920 JPEG", "Competitor visitors (groom)", "PetSmart, Petco, local groomers", "$20 OFF / GRM20", "June–Aug", "Upsell: full groom service conquest"],
      ].map((r, i) => new TableRow({ children: r.map(t => cell(t, { bg: i % 2 === 0 ? WHITE : LGRAY })) })),
    ]
  }),
];

// ─── PAGE 4: Assets, Budget, Checklist ────────────────────────────────────────
const page4 = [
  new Paragraph({ children: [new PageBreak()] }),

  // Assets still needed
  sectionTitle("Remaining Assets Needed"),
  para("GDN and DID core assets are complete. The following optional/extended placements remain:", { spaceAfter: 80 }),

  new Table({
    width: { size: 14400, type: WidthType.DXA },
    columnWidths: [2400, 2000, 1800, 2400, 5800],
    rows: [
      new TableRow({ children: [
        hCell("Asset"),
        hCell("Dimensions"),
        hCell("Channel"),
        hCell("Priority"),
        hCell("Notes"),
      ]}),
      ...[
        ["Story / Vertical Video", "1080×1920", "Instagram / Meta", "Medium", "If Meta advertising is activated; 15-sec video"],
        ["Billboard Banner", "970×250", "GDN Premium", "Low", "Optional premium placement; rarely served"],
        ["Responsive Display Ad", "Flexible", "GDN Smart", "Medium", "Upload cropped assets to Google for RDA auto-assembly"],
      ].map((r, i) => new TableRow({ children: r.map(t => cell(t, { bg: i % 2 === 0 ? WHITE : LGRAY })) })),
    ]
  }),

  para("", { spaceAfter: 160 }),

  // Budget
  sectionTitle("Media Budget Summary"),
  para("", { spaceAfter: 60 }),

  new Table({
    width: { size: 14400, type: WidthType.DXA },
    columnWidths: [3200, 2400, 2400, 2400, 4000],
    rows: [
      new TableRow({ children: [
        hCell("Channel"),
        hCell("Monthly Budget"),
        hCell("Est. Impressions"),
        hCell("Est. Clicks"),
        hCell("Goal"),
      ]}),
      ...[
        ["Pmax", "$1,500", "~120,000", "~900", "Conversion (booking)"],
        ["SEM", "$900", "~30,000", "~600", "High-intent search capture"],
        ["GDN Display", "$850", "~500,000", "~500", "Brand awareness + retargeting"],
        ["DID Geofencing", "$600", "~200,000", "~300", "Conquest + dog park proximity"],
        ["Retargeting", "$457", "~150,000", "~450", "Re-engage site visitors"],
        ["TOTAL", "$4,307", "~1,000,000", "~2,750", "New customer acquisition"],
      ].map((r, i) => new TableRow({ children: r.map(t => cell(t, { bg: i === 5 ? LORANGE : i % 2 === 0 ? WHITE : LGRAY, bold: i === 5 })) })),
    ]
  }),

  para("", { spaceAfter: 160 }),

  // Pre-Launch Checklist
  sectionTitle("Pre-Launch Checklist"),
  para("", { spaceAfter: 60 }),

  new Table({
    width: { size: 14400, type: WidthType.DXA },
    columnWidths: [800, 8000, 2400, 3200],
    rows: [
      new TableRow({ children: [
        hCell("✓"),
        hCell("Task"),
        hCell("Owner"),
        hCell("Deadline"),
      ]}),
      ...[
        ["☐", "Upload all 12 GIF files to Google Ads asset library", "Agency", "June 1"],
        ["☐", "Set up GDN campaigns: Retargeting + Prospecting ad groups", "Agency", "June 1"],
        ["☐", "Confirm BATH20 coupon is active in POS system", "S&D Boca", "June 1"],
        ["☐", "Confirm GRM20 coupon is active in POS system", "S&D Boca", "June 1"],
        ["☐", "Upload 4 DID JPEG files to DSP / geofencing platform", "Agency", "June 1"],
        ["☐", "Define DID geofence polygons: dog parks (Boca)", "Agency", "June 3"],
        ["☐", "Define DID geofence polygons: competitor locations", "Agency", "June 3"],
        ["☐", "Define DID geofence polygons: HOA zip codes", "Agency", "June 3"],
        ["☐", "Set UTM parameters on all landing page links", "Agency", "June 1"],
        ["☐", "Verify Google Analytics goal tracking for booking form", "Agency", "June 1"],
        ["☐", "Set up coupon redemption tracking in POS", "S&D Boca", "June 5"],
        ["☐", "Schedule mid-flight creative swap for July 15", "Agency", "June 30"],
        ["☐", "Week 1 performance review call", "Both", "June 8"],
      ].map((r, i) => new TableRow({ children: r.map(t => cell(t, { bg: i % 2 === 0 ? WHITE : LGRAY })) })),
    ]
  }),
];

// ─── PAGE 5: Copy Reference ────────────────────────────────────────────────────
const page5 = [
  new Paragraph({ children: [new PageBreak()] }),
  sectionTitle("Ad Copy Reference"),
  para("All units use these confirmed copy elements. Do not modify offer amounts or coupon codes.", { spaceAfter: 80, italics: true }),

  subTitle("GDN Display — Bath Campaign (BATH20)"),

  new Table({
    width: { size: 14400, type: WidthType.DXA },
    columnWidths: [2800, 11600],
    rows: [
      new TableRow({ children: [ hCell("Element"), hCell("Copy") ] }),
      ...[
        ["Headline", "Your Dog Deserves a Spa Day"],
        ["Sub-headline", "Professional bath, brush & blowout"],
        ["Offer", "$20 OFF Your First Visit"],
        ["Coupon Code", "BATH20"],
        ["CTA Button", "Book Now"],
        ["Legal Line", "New customers only. One per household. Boca Raton location."],
      ].map((r, i) => new TableRow({ children: r.map(t => cell(t, { bg: i % 2 === 0 ? WHITE : LGRAY })) })),
    ]
  }),

  para("", { spaceAfter: 120 }),
  subTitle("GDN Display — Groom Campaign (GRM20)"),

  new Table({
    width: { size: 14400, type: WidthType.DXA },
    columnWidths: [2800, 11600],
    rows: [
      new TableRow({ children: [ hCell("Element"), hCell("Copy") ] }),
      ...[
        ["Headline", "Full Groom. Happy Pup."],
        ["Sub-headline", "Bath, cut, nails & more — by certified groomers"],
        ["Offer", "$20 OFF Your First Groom"],
        ["Coupon Code", "GRM20"],
        ["CTA Button", "Book Now"],
        ["Legal Line", "New customers only. One per household. Boca Raton location."],
      ].map((r, i) => new TableRow({ children: r.map(t => cell(t, { bg: i % 2 === 0 ? WHITE : LGRAY })) })),
    ]
  }),

  para("", { spaceAfter: 120 }),
  subTitle("DID Geofencing — All Versions"),

  new Table({
    width: { size: 14400, type: WidthType.DXA },
    columnWidths: [1600, 2400, 4000, 4200, 2200],
    rows: [
      new TableRow({ children: [ hCell("Version"), hCell("Headline"), hCell("Body"), hCell("CTA"), hCell("Code") ] }),
      ...[
        ["A – Dog Park", "Your Dog's Favorite Spot Is Waiting", "Fresh from the park? Book a bath at Splash and Dash!", "Book Now — $20 OFF First Bath", "BATH20"],
        ["B – Conquest Bath", "Better Than the Rest. Cleaner Too.", "We'll have your pup looking (and smelling) amazing.", "Switch & Save $20", "BATH20"],
        ["C – HOA Awareness", "The Neighborhood's Favorite Groomer", "Premium grooming in Boca Raton. Your dog will love it.", "First Bath $20 OFF", "BATH20"],
        ["D – Conquest Groom", "Your Dog Deserves the Full Treatment", "Professional full groom — the best in Boca Raton.", "First Groom $20 OFF", "GRM20"],
      ].map((r, i) => new TableRow({ children: r.map(t => cell(t, { bg: i % 2 === 0 ? WHITE : LGRAY })) })),
    ]
  }),

  para("", { spaceAfter: 200 }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 60 },
    children: [new TextRun({ text: "Splash and Dash Boca Raton  |  Creative Deployment Plan  |  Summer 2026", color: "999999", size: 16, font: "Calibri" })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    children: [new TextRun({ text: "Confidential — For Agency Use", italics: true, color: "AAAAAA", size: 14, font: "Calibri" })]
  }),
];

// ─── Assemble & Export ─────────────────────────────────────────────────────────
const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 15840, height: 12240, orientation: PageOrientation.LANDSCAPE },
        margin: { top: 720, bottom: 720, left: 720, right: 720 },
      }
    },
    children: [
      ...page1,
      ...page2,
      ...page3,
      ...page4,
      ...page5,
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  const out = '/home/user/SD_Boca_Creative_Deployment_Plan_v2_Summer2026.docx';
  fs.writeFileSync(out, buf);
  console.log(`✅ Written: ${out}  (${(buf.length / 1024).toFixed(1)} KB)`);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
