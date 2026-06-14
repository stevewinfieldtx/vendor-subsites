/* Sales deck builder — unbranded, both audiences. */
const path = require("path");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Fa = require("react-icons/fa");

// ---- palette / type -------------------------------------------------------
const NAVY = "0B1437";
const NAVY2 = "152252";
const CYAN = "22D3EE";
const CYAN_DK = "0E7490";
const EMERALD = "34D399";
const AMBER = "FBBF24";
const WHITE = "FFFFFF";
const ICE = "C9DBF7";
const INK = "0E1A3A";
const MUTED = "5B6485";
const CARD = "F3F6FB";
const LINE = "E2E8F0";
const HEAD = "Trebuchet MS";
const BODY = "Calibri";

const W = 13.33, H = 7.5;
const mkShadow = () => ({ type: "outer", color: "0B1437", blur: 9, offset: 3, angle: 135, opacity: 0.16 });

// ---- icons ----------------------------------------------------------------
async function icon(Comp, color = "#FFFFFF", size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color, size: String(size) }));
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}
const ICON_NAMES = [
  "FaCopy","FaHourglassEnd","FaUnlink","FaDatabase","FaCogs","FaWindowMaximize",
  "FaPlayCircle","FaBookOpen","FaUsers","FaRobot","FaAward","FaHandshake",
  "FaLayerGroup","FaCheckCircle","FaSyncAlt","FaEye","FaBolt","FaPalette",
  "FaHeadset","FaLeaf","FaBullseye","FaMicrophoneAlt","FaSitemap","FaSwatchbook",
  "FaPlug","FaPlay","FaQuoteLeft",
];

async function main() {
  const I = {};
  await Promise.all(ICON_NAMES.map(async (n) => { I[n] = await icon(Fa[n], "#FFFFFF"); }));
  const playDark = await icon(Fa.FaPlay, "#0B1437");

  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "Sales";
  pres.title = "Living Vendor Microsites";

  // helpers ----------------------------------------------------------------
  const iconCircle = (s, x, y, d, circleColor, key) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: circleColor }, line: { type: "none" }, shadow: mkShadow() });
    s.addImage({ data: I[key], x: x + d * 0.26, y: y + d * 0.26, w: d * 0.48, h: d * 0.48 });
  };
  const footer = (s, n) => {
    s.addText("LIVING VENDOR MICROSITES", { x: 0.7, y: 7.06, w: 5, h: 0.3, fontFace: BODY, fontSize: 8, color: "AAB2C5", charSpacing: 2, align: "left" });
    s.addText(String(n), { x: 12.2, y: 7.06, w: 0.5, h: 0.3, fontFace: BODY, fontSize: 9, color: "AAB2C5", align: "right" });
  };
  const heading = (s, title, sub) => {
    s.addText(title, { x: 0.7, y: 0.5, w: 12, h: 0.85, fontFace: HEAD, fontSize: 31, bold: true, color: INK, margin: 0 });
    if (sub) s.addText(sub, { x: 0.7, y: 1.38, w: 11.6, h: 0.7, fontFace: BODY, fontSize: 15, color: MUTED, margin: 0 });
  };
  const card = (s, x, y, w, h, fill = CARD) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.1, fill: { color: fill }, line: { color: LINE, width: 1 }, shadow: mkShadow() });
  };

  // ===== Slide 1 — TITLE =====
  {
    const s = pres.addSlide();
    s.background = { color: NAVY };
    // motif: stacked "site" cards on right
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.55, y: 2.55, w: 3.0, h: 2.0, rectRadius: 0.08, fill: { color: NAVY2 }, line: { color: EMERALD, width: 1.5 } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.15, y: 2.15, w: 3.0, h: 2.0, rectRadius: 0.08, fill: { color: NAVY2 }, line: { color: CYAN_DK, width: 1.5 } });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.75, y: 1.75, w: 3.0, h: 2.0, rectRadius: 0.08, fill: { color: "1B2C63" }, line: { color: CYAN, width: 2 }, shadow: mkShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: 9.0, y: 2.0, w: 1.1, h: 0.16, fill: { color: CYAN } });
    s.addShape(pres.shapes.RECTANGLE, { x: 9.0, y: 2.3, w: 2.4, h: 0.1, fill: { color: "3C4E86" } });
    s.addShape(pres.shapes.RECTANGLE, { x: 9.0, y: 2.5, w: 2.0, h: 0.1, fill: { color: "3C4E86" } });
    s.addShape(pres.shapes.OVAL, { x: 9.95, y: 2.85, w: 0.62, h: 0.62, fill: { color: CYAN } });
    s.addImage({ data: I.FaPlay, x: 10.12, y: 3.02, w: 0.28, h: 0.28 });

    s.addText("PLATFORM OVERVIEW", { x: 0.9, y: 1.25, w: 7, h: 0.4, fontFace: BODY, fontSize: 13, bold: true, color: CYAN, charSpacing: 3, margin: 0 });
    s.addText("Living Vendor\nMicrosites", { x: 0.9, y: 1.75, w: 7.6, h: 2.1, fontFace: HEAD, fontSize: 50, bold: true, color: WHITE, lineSpacingMultiple: 0.95, margin: 0 });
    s.addText("AI-grounded, partner-branded solution pages — that keep themselves current.", { x: 0.9, y: 3.95, w: 7.4, h: 0.9, fontFace: BODY, fontSize: 19, color: ICE, margin: 0 });
    s.addText(
      [
        { text: "Accurate to the vendor", options: { color: CYAN, bold: true } },
        { text: "    •    ", options: { color: "5C6CA6" } },
        { text: "Branded to the partner", options: { color: CYAN, bold: true } },
        { text: "    •    ", options: { color: "5C6CA6" } },
        { text: "Always up to date", options: { color: CYAN, bold: true } },
      ],
      { x: 0.9, y: 5.15, w: 9, h: 0.5, fontFace: BODY, fontSize: 14, margin: 0 }
    );
    s.addText("A platform for vendors and the partners who sell them.", { x: 0.9, y: 6.6, w: 9, h: 0.4, fontFace: BODY, fontSize: 12, italic: true, color: "8FA0C8", margin: 0 });
  }

  // ===== Slide 2 — PROBLEM =====
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    heading(s, "The channel content gap", "Vendors sell through partners. But partners rarely represent a product the way its maker would.");
    const items = [
      ["FaCopy", "C2410C", "Generic & off-brand", "Partners paste a logo on a datasheet. The product's real story never lands."],
      ["FaHourglassEnd", "B45309", "Always a step behind", "The vendor ships new features; partner pages still show last year's pitch."],
      ["FaUnlink", "9F1239", "The message drifts", "Dozens of partners, dozens of inconsistent — often inaccurate — descriptions."],
    ];
    const gap = 0.45, x0 = 0.7, cw = (W - 2 * x0 - 2 * gap) / 3, cy = 2.45, ch = 3.5;
    items.forEach(([ic, col, h, d], i) => {
      const x = x0 + i * (cw + gap);
      card(s, x, cy, cw, ch);
      iconCircle(s, x + 0.45, cy + 0.45, 0.95, col, ic);
      s.addText(h, { x: x + 0.4, y: cy + 1.6, w: cw - 0.8, h: 0.6, fontFace: HEAD, fontSize: 19, bold: true, color: INK, margin: 0 });
      s.addText(d, { x: x + 0.4, y: cy + 2.2, w: cw - 0.8, h: 1.1, fontFace: BODY, fontSize: 14, color: MUTED, margin: 0 });
    });
    s.addText(
      [{ text: "Result:  ", options: { bold: true, color: INK } }, { text: "weaker channel sales, a diluted brand, and more vendor hand-holding.", options: { color: MUTED } }],
      { x: 0.7, y: 6.3, w: 12, h: 0.5, fontFace: BODY, fontSize: 15, align: "center", margin: 0 }
    );
    footer(s, 2);
  }

  // ===== Slide 3 — WHAT IT IS =====
  {
    const s = pres.addSlide();
    s.background = { color: NAVY };
    s.addText("One source of truth.\nA site for every partner.", { x: 0.8, y: 0.7, w: 11.8, h: 1.7, fontFace: HEAD, fontSize: 34, bold: true, color: WHITE, lineSpacingMultiple: 1.0, margin: 0 });
    s.addText("The platform turns a vendor's own content into branded, AI-grounded microsites — one per partner — that stay accurate and refresh automatically.", { x: 0.8, y: 2.5, w: 11.4, h: 0.8, fontFace: BODY, fontSize: 16, color: ICE, margin: 0 });

    const nodes = [
      ["FaDatabase", "Vendor content", "Site, docs, decks — the source of record"],
      ["FaCogs", "Knowledge engine", "Decomposed into tagged, structured atoms"],
      ["FaWindowMaximize", "Partner microsite", "On-brand page + AI advisor, per reseller"],
    ];
    const nw = 3.35, ny = 4.0, nh = 2.3, gap = 1.05, x0 = (W - (nw * 3 + gap * 2)) / 2;
    nodes.forEach(([ic, t, d], i) => {
      const x = x0 + i * (nw + gap);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: ny, w: nw, h: nh, rectRadius: 0.09, fill: { color: NAVY2 }, line: { color: CYAN, width: 1.5 }, shadow: mkShadow() });
      iconCircle(s, x + nw / 2 - 0.45, ny + 0.32, 0.9, CYAN_DK, ic);
      s.addText(t, { x: x + 0.2, y: ny + 1.32, w: nw - 0.4, h: 0.5, fontFace: HEAD, fontSize: 18, bold: true, color: WHITE, align: "center", margin: 0 });
      s.addText(d, { x: x + 0.25, y: ny + 1.78, w: nw - 0.5, h: 0.5, fontFace: BODY, fontSize: 12.5, color: ICE, align: "center", margin: 0 });
      if (i < 2) s.addText("→", { x: x + nw + 0.08, y: ny + 0.75, w: 0.9, h: 0.8, fontFace: HEAD, fontSize: 34, bold: true, color: CYAN, align: "center", margin: 0 });
    });
  }

  // ===== Slide 4 — HOW IT WORKS =====
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    heading(s, "How it works", "From the vendor's raw content to a partner-ready selling page — in four moves.");
    const steps = [
      ["Decompose", "The vendor's content is broken into tagged atoms — every claim, capability, and proof point."],
      ["Configure", "Each partner is a profile: brand colors, logo, and the vendors they carry."],
      ["Generate", "Pages are written from the atoms (accurate), voiced in the partner's tone — not generic AI."],
      ["Advise & refresh", "An AI advisor answers buyers from the same source; content refreshes as the vendor updates."],
    ];
    const gap = 0.4, x0 = 0.7, cw = (W - 2 * x0 - 3 * gap) / 4, cy = 2.5, ch = 3.7;
    steps.forEach(([t, d], i) => {
      const x = x0 + i * (cw + gap);
      card(s, x, cy, cw, ch, WHITE);
      s.addShape(pres.shapes.OVAL, { x: x + 0.35, y: cy + 0.4, w: 0.85, h: 0.85, fill: { color: i % 2 ? CYAN_DK : NAVY }, line: { type: "none" }, shadow: mkShadow() });
      s.addText(String(i + 1), { x: x + 0.35, y: cy + 0.4, w: 0.85, h: 0.85, fontFace: HEAD, fontSize: 30, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0 });
      s.addText(t, { x: x + 0.32, y: cy + 1.45, w: cw - 0.6, h: 0.5, fontFace: HEAD, fontSize: 17, bold: true, color: INK, margin: 0 });
      s.addText(d, { x: x + 0.32, y: cy + 2.0, w: cw - 0.6, h: 1.5, fontFace: BODY, fontSize: 13, color: MUTED, margin: 0 });
    });
    footer(s, 4);
  }

  // ===== Slide 5 — WHAT EVERY SITE INCLUDES =====
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    heading(s, "What every microsite includes", "A complete, conversion-ready selling page — generated, not hand-built.");
    const feats = [
      ["FaPlayCircle", CYAN_DK, "Product hero + real video", "The vendor's best demo, front and center."],
      ["FaBookOpen", CYAN_DK, "Grounded messaging", "Pain points and capabilities pulled from the source, never invented."],
      ["FaUsers", CYAN_DK, "Role & industry views", "The pitch reframes itself for CISO, CFO, ops — by sector."],
      ["FaRobot", NAVY, "AI solution advisor", "Answers buyer questions 24/7 from the vendor's knowledge."],
      ["FaAward", NAVY, "Proof & resources", "Testimonials, badges, and the latest releases — auto-listed."],
      ["FaHandshake", NAVY, "Partner value-add", "The reseller's own services, brand, and contact, woven in."],
    ];
    const gx = 0.4, gy = 0.4, x0 = 0.7, y0 = 2.4, cw = (W - 2 * x0 - 2 * gx) / 3, ch = 2.0;
    feats.forEach(([ic, col, h, d], i) => {
      const r = Math.floor(i / 3), c = i % 3;
      const x = x0 + c * (cw + gx), y = y0 + r * (ch + gy);
      card(s, x, y, cw, ch, CARD);
      iconCircle(s, x + 0.32, y + 0.34, 0.72, col, ic);
      s.addText(h, { x: x + 1.2, y: y + 0.34, w: cw - 1.4, h: 0.72, fontFace: HEAD, fontSize: 15.5, bold: true, color: INK, valign: "middle", margin: 0 });
      s.addText(d, { x: x + 0.34, y: y + 1.18, w: cw - 0.65, h: 0.7, fontFace: BODY, fontSize: 12.5, color: MUTED, margin: 0 });
    });
    footer(s, 5);
  }

  // ===== Slide 6 — FOR VENDORS =====
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addText([{ text: "For ", options: { color: INK } }, { text: "Vendors", options: { color: CYAN_DK } }], { x: 0.7, y: 0.5, w: 11, h: 0.85, fontFace: HEAD, fontSize: 31, bold: true, margin: 0 });
    s.addText("Turn every partner into an on-message extension of your marketing team.", { x: 0.7, y: 1.38, w: 11.6, h: 0.6, fontFace: BODY, fontSize: 15, color: MUTED, margin: 0 });
    const rows = [
      ["FaLayerGroup", "Channel enablement at scale", "Every partner gets a professional, accurate product site in minutes — not weeks of agency work."],
      ["FaCheckCircle", "Brand-accurate everywhere", "Messaging is generated from your content. No more partners improvising your value prop."],
      ["FaSyncAlt", "Always current from the source", "Ship a feature or a new release; partner sites update themselves on the next refresh."],
      ["FaEye", "Visibility & control", "One source feeds them all — you shape the narrative across the entire channel."],
    ];
    const gx = 0.5, gy = 0.45, x0 = 0.7, y0 = 2.35, cw = (W - 2 * x0 - gx) / 2, ch = 2.0;
    rows.forEach(([ic, h, d], i) => {
      const r = Math.floor(i / 2), c = i % 2;
      const x = x0 + c * (cw + gx), y = y0 + r * (ch + gy);
      card(s, x, y, cw, ch, CARD);
      iconCircle(s, x + 0.38, y + 0.55, 0.9, CYAN_DK, ic);
      s.addText(h, { x: x + 1.55, y: y + 0.35, w: cw - 1.8, h: 0.55, fontFace: HEAD, fontSize: 17, bold: true, color: INK, margin: 0 });
      s.addText(d, { x: x + 1.55, y: y + 0.88, w: cw - 1.85, h: 1.0, fontFace: BODY, fontSize: 13, color: MUTED, margin: 0 });
    });
    footer(s, 6);
  }

  // ===== Slide 7 — FOR PARTNERS =====
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    s.addText([{ text: "For ", options: { color: INK } }, { text: "Partners & Resellers", options: { color: "0F9D6B" } }], { x: 0.7, y: 0.5, w: 12, h: 0.85, fontFace: HEAD, fontSize: 31, bold: true, margin: 0 });
    s.addText("Sell more of every line card — without becoming an expert on each product.", { x: 0.7, y: 1.38, w: 11.6, h: 0.6, fontFace: BODY, fontSize: 15, color: MUTED, margin: 0 });
    const rows = [
      ["FaBolt", "Instant authority", "A polished, vendor-accurate site for each product you carry — branded as yours."],
      ["FaPalette", "Your brand, your deal", "Your logo, colors, services, and CTAs. You own the buyer relationship end to end."],
      ["FaHeadset", "An AI rep that never sleeps", "The advisor qualifies and answers prospects around the clock, from real product knowledge."],
      ["FaLeaf", "Zero maintenance", "Vendor content refreshes centrally — you never touch the page to keep it accurate."],
    ];
    const EM = "0F9D6B";
    const gx = 0.5, gy = 0.45, x0 = 0.7, y0 = 2.35, cw = (W - 2 * x0 - gx) / 2, ch = 2.0;
    rows.forEach(([ic, h, d], i) => {
      const r = Math.floor(i / 2), c = i % 2;
      const x = x0 + c * (cw + gx), y = y0 + r * (ch + gy);
      card(s, x, y, cw, ch, CARD);
      iconCircle(s, x + 0.38, y + 0.55, 0.9, EM, ic);
      s.addText(h, { x: x + 1.55, y: y + 0.35, w: cw - 1.8, h: 0.55, fontFace: HEAD, fontSize: 17, bold: true, color: INK, margin: 0 });
      s.addText(d, { x: x + 1.55, y: y + 0.88, w: cw - 1.85, h: 1.0, fontFace: BODY, fontSize: 13, color: MUTED, margin: 0 });
    });
    footer(s, 7);
  }

  // ===== Slide 8 — SELF-UPDATING =====
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    heading(s, "The page maintains itself", "Centrally-controlled vendor content refreshes on a schedule. Partner content stays the partner's.");
    // before column
    const colW = 5.6, y0 = 2.45, ch = 3.7, x1 = 0.7, x2 = W - 0.7 - colW;
    card(s, x1, y0, colW, ch, CARD);
    s.addText("THIS QUARTER", { x: x1 + 0.4, y: y0 + 0.3, w: colW - 0.8, h: 0.4, fontFace: BODY, fontSize: 12, bold: true, color: MUTED, charSpacing: 2, margin: 0 });
    const before = ["Hero: “Turn your people into your strongest defense”", "Cadence: Monthly new episodes", "Capabilities: phishing, behavior, risk scoring", "Library: current episodes & guides"];
    s.addText(before.map((t) => ({ text: t, options: { bullet: { indent: 14 }, breakLine: true, paraSpaceAfter: 8 } })), { x: x1 + 0.4, y: y0 + 0.85, w: colW - 0.8, h: ch - 1.1, fontFace: BODY, fontSize: 13.5, color: INK, margin: 0 });

    s.addText("→", { x: (x1 + colW + x2) / 2 - 0.35, y: y0 + ch / 2 - 0.5, w: 0.7, h: 1.0, fontFace: HEAD, fontSize: 40, bold: true, color: CYAN_DK, align: "center", valign: "middle", margin: 0 });

    // after column (highlighted)
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x2, y: y0, w: colW, h: ch, rectRadius: 0.1, fill: { color: "FEFCE8" }, line: { color: "DC2626", width: 1.5, dashType: "dash" }, shadow: mkShadow() });
    s.addText("NEXT QUARTER — AUTO-UPDATED", { x: x2 + 0.4, y: y0 + 0.3, w: colW - 0.8, h: 0.4, fontFace: BODY, fontSize: 12, bold: true, color: "B91C1C", charSpacing: 1.5, margin: 0 });
    const after = [
      [{ text: "Hero: “Outsmart the deepfake era”", options: { highlight: AMBER } }],
      [{ text: "Cadence: ", options: {} }, { text: "Weekly", options: { bold: true, highlight: AMBER } }, { text: " new episodes", options: {} }],
      [{ text: "Capabilities: ", options: {} }, { text: "+ AI-threat & deepfake coverage", options: { bold: true, highlight: AMBER } }],
      [{ text: "Library: ", options: {} }, { text: "new “Deepfake Wire Fraud”, “Quishing”…", options: { highlight: AMBER } }],
    ];
    const runs = [];
    after.forEach((line) => {
      line.forEach((r, j) => {
        runs.push({ text: r.text, options: { ...r.options, bullet: j === 0 ? { indent: 14 } : false, breakLine: j === line.length - 1, paraSpaceAfter: 8 } });
      });
    });
    s.addText(runs, { x: x2 + 0.4, y: y0 + 0.85, w: colW - 0.8, h: ch - 1.1, fontFace: BODY, fontSize: 13.5, color: INK, margin: 0 });

    s.addText([{ text: "Highlighted = centrally updated by the platform.   ", options: { color: "B91C1C", bold: true } }, { text: "The partner's branding, services, and contact never change.", options: { color: MUTED } }], { x: 0.7, y: 6.35, w: 12, h: 0.5, fontFace: BODY, fontSize: 13.5, align: "center", margin: 0 });
    footer(s, 8);
  }

  // ===== Slide 9 — CASE STUDY =====
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    heading(s, "In the wild: NINJIO × Rain Networks", "A security-awareness vendor, sold by a reseller — a live page built on the platform.");
    // faux browser frame
    const bx = 0.7, by = 2.4, bw = 6.0, bh = 3.95;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y: by, w: bw, h: bh, rectRadius: 0.06, fill: { color: "0B1437" }, line: { color: LINE, width: 1 }, shadow: mkShadow() });
    s.addShape(pres.shapes.RECTANGLE, { x: bx, y: by, w: bw, h: 0.42, fill: { color: "1B2C63" } });
    ["F87171", "FBBF24", "34D399"].forEach((c, i) => s.addShape(pres.shapes.OVAL, { x: bx + 0.22 + i * 0.26, y: by + 0.14, w: 0.14, h: 0.14, fill: { color: c }, line: { type: "none" } }));
    s.addText("NINJIO", { x: bx + 0.4, y: by + 0.65, w: 3, h: 0.5, fontFace: HEAD, fontSize: 20, bold: true, color: CYAN, margin: 0 });
    s.addText("Turn employees into your strongest security asset", { x: bx + 0.4, y: by + 1.2, w: bw - 0.8, h: 1.0, fontFace: HEAD, fontSize: 21, bold: true, color: WHITE, margin: 0 });
    s.addText("Delivered by Rain Networks", { x: bx + 0.4, y: by + 2.2, w: bw - 0.8, h: 0.4, fontFace: BODY, fontSize: 12, color: ICE, margin: 0 });
    // video tile
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx + bw - 2.4, y: by + 2.65, w: 2.0, h: 1.1, rectRadius: 0.05, fill: { color: "0E7490" }, line: { type: "none" } });
    s.addShape(pres.shapes.OVAL, { x: bx + bw - 1.55, y: by + 3.0, w: 0.45, h: 0.45, fill: { color: WHITE } });
    s.addImage({ data: playDark, x: bx + bw - 1.41, y: by + 3.12, w: 0.2, h: 0.2 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx + 0.4, y: by + 2.95, w: 1.5, h: 0.45, rectRadius: 0.06, fill: { color: CYAN } });
    s.addText("Talk to an expert", { x: bx + 0.4, y: by + 2.95, w: 1.5, h: 0.45, fontFace: BODY, fontSize: 11, bold: true, color: "0B1437", align: "center", valign: "middle", margin: 0 });

    // highlights
    const hx = bx + bw + 0.6, hw = W - 0.7 - hx;
    const pts = [
      ["FaBullseye", "Grounded in 3,400+ NINJIO content atoms — every line traces to the source."],
      ["FaPalette", "Rain Networks' logo, blue palette, and Poppins font throughout."],
      ["FaPlayCircle", "Real NINJIO episodes embedded — including the Jon Lovitz feature."],
      ["FaRobot", "An AI advisor answers prospect questions live, on the page."],
      ["FaBolt", "Themed and stood up in hours — not a multi-week web project."],
    ];
    const rh = 0.74, ry = by + 0.05;
    pts.forEach(([ic, t], i) => {
      const y = ry + i * rh;
      iconCircle(s, hx, y, 0.5, i < 3 ? CYAN_DK : NAVY, ic);
      s.addText(t, { x: hx + 0.72, y: y - 0.06, w: hw - 0.72, h: 0.66, fontFace: BODY, fontSize: 13.5, color: INK, valign: "middle", margin: 0 });
    });
    footer(s, 9);
  }

  // ===== Slide 10 — WHY DIFFERENT =====
  {
    const s = pres.addSlide();
    s.background = { color: WHITE };
    heading(s, "Why this isn't just another website builder", "Five things a template tool and a generic AI writer can't give you.");
    const rows = [
      ["FaBullseye", "Grounded, not guessed", "Copy traces back to the vendor's real content — no hallucinated claims or features."],
      ["FaMicrophoneAlt", "Voice-matched", "Each page reads in the partner's tone, not a one-size-fits-all template."],
      ["FaSitemap", "Truly multi-tenant", "One platform, unlimited partner-and-vendor combinations from shared sources."],
      ["FaSwatchbook", "Six design languages", "Sites don't look cookie-cutter — pick an archetype that fits the brand."],
      ["FaPlug", "Flexible to deploy", "Drop-in widget, branded subdomain, or full reverse-proxy into an existing site."],
    ];
    const rh = 0.82, y0 = 2.45, x0 = 0.7;
    rows.forEach(([ic, h, d], i) => {
      const y = y0 + i * rh;
      iconCircle(s, x0, y, 0.6, i % 2 ? NAVY : CYAN_DK, ic);
      s.addText([{ text: h + "   ", options: { bold: true, color: INK } }, { text: d, options: { color: MUTED } }], { x: x0 + 0.85, y: y - 0.05, w: W - x0 - 0.85 - 0.7, h: 0.7, fontFace: BODY, fontSize: 14.5, valign: "middle", margin: 0 });
    });
    footer(s, 10);
  }

  // ===== Slide 11 — CLOSING =====
  {
    const s = pres.addSlide();
    s.background = { color: NAVY };
    s.addShape(pres.shapes.OVAL, { x: 10.3, y: -1.2, w: 4.5, h: 4.5, fill: { color: "12205A" }, line: { type: "none" } });
    s.addShape(pres.shapes.OVAL, { x: 11.2, y: 4.7, w: 3.6, h: 3.6, fill: { color: "12205A" }, line: { type: "none" } });
    s.addText("Let's build your first site.", { x: 0.9, y: 2.3, w: 11, h: 1.1, fontFace: HEAD, fontSize: 44, bold: true, color: WHITE, margin: 0 });
    s.addText("Pick one vendor. We'll have a branded, AI-grounded microsite live for your review — fast.", { x: 0.9, y: 3.5, w: 10.5, h: 0.9, fontFace: BODY, fontSize: 19, color: ICE, margin: 0 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.9, y: 4.75, w: 2.7, h: 0.7, rectRadius: 0.08, fill: { color: CYAN }, line: { type: "none" } });
    s.addText("Start a pilot  →", { x: 0.9, y: 4.75, w: 2.7, h: 0.7, fontFace: HEAD, fontSize: 16, bold: true, color: "0B1437", align: "center", valign: "middle", margin: 0 });
    s.addText("[ your name ]   •   [ email ]   •   [ website ]", { x: 0.9, y: 6.5, w: 11, h: 0.4, fontFace: BODY, fontSize: 13, color: "8FA0C8", margin: 0 });
  }

  const out = path.join(__dirname, "Vendor-Microsites-Sales-Deck.pptx");
  await pres.writeFile({ fileName: out });
  console.log("WROTE", out);
}
main().catch((e) => { console.error(e); process.exit(1); });
