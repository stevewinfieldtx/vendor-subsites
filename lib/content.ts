/**
 * Subsite content model + provider.
 *
 * The page renders from a single `SubsiteContent` object. In production that
 * object is assembled from TDE `reconstruct()` calls (so copy is grounded in the
 * vendor's 9D atoms AND voiced in the reseller's tone). Until TDE is wired, a
 * mock builder produces a full, realistic object so the design renders end-to-end.
 *
 * Provider selection is automatic: `getSubsiteContent` uses TDE when configured,
 * otherwise mock. TDE failures degrade per-section to the mock, never crash.
 */

import "server-only";
import { unstable_cache } from "next/cache";
import { getTdeClient, type Persona, type TdeClient } from "./tde";
import type { ResellerConfig, VendorMapping, VendorVideo } from "./tenant";

// ----------------------------------------------------------------------------
// Model
// ----------------------------------------------------------------------------

export interface Cta {
  label: string;
  href: string;
}

export interface HeroContent {
  eyebrow: string;
  headline: string;
  subheadline: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  aiCta?: Cta;
}

export interface PainPoint {
  problem: string;
  impact: string;
  solution: string;
}

export interface Capability {
  title: string;
  outcome: string;
}

export interface WhyBuyFromUs {
  intro: string;
  services: string[];
}

export interface Stat {
  value: string;
  label: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
}

export interface ProofLayer {
  stats: Stat[];
  badges: string[];
  testimonials: Testimonial[];
}

export interface RoleView {
  persona: Persona;
  label: string;
  headline: string;
  points: string[];
}

export interface IndustryView {
  industry: string;
  headline: string;
  points: string[];
}

export interface FeedItem {
  title: string;
  kind: "Release" | "Article" | "Advisory" | "Webinar" | "Guide" | "Episode";
  date?: string;
  href?: string;
}

/**
 * A simulated future refresh, used by the interactive "show next quarter"
 * demo control. Illustrates the breadth of what the platform auto-updates
 * from the source — no manual maintenance.
 */
export interface QuarterlyUpdate {
  /** e.g. "Q3 2026". */
  label: string;
  feed: FeedItem[];
  newCapability: Capability;
  statHighlight: Stat;
}

export type VideoRef = VendorVideo;

export interface SubsiteContent {
  vendorName: string;
  productName: string;
  resellerName: string;
  vendorTagline?: string;
  /** Featured showcase video (the product's strongest demo). */
  featuredVideo?: VideoRef;
  /** Additional sample videos for the "see it in action" strip. */
  videoGallery?: VideoRef[];
  hero: HeroContent;
  painMap: PainPoint[];
  capabilities: Capability[];
  whyBuyFromUs: WhyBuyFromUs;
  proof: ProofLayer;
  roles?: RoleView[];
  industries?: IndustryView[];
  contentFeed: FeedItem[];
  /** Demo-only: the simulated next refresh cycle for the interactive control. */
  nextQuarter?: QuarterlyUpdate;
  finalCta: { headline: string; button: Cta };
  gaps?: string[];
  isMock: boolean;
}

// ----------------------------------------------------------------------------
// Shared CTA helpers
// ----------------------------------------------------------------------------

function ctas(config: ResellerConfig) {
  const book = config.contact.calendarUrl ?? "#contact";
  return {
    primary: { label: "Talk to an expert", href: book } as Cta,
    secondary: { label: "Explore the solution", href: "#solution" } as Cta,
    ai: { label: "Ask the AI advisor", href: "#advisor" } as Cta,
    final: { label: "Map this to your environment", href: book } as Cta,
  };
}

// ----------------------------------------------------------------------------
// Mock provider — realistic stand-in / per-section fallback.
// ----------------------------------------------------------------------------

export function mockContent(
  config: ResellerConfig,
  vendor: VendorMapping,
): SubsiteContent {
  const c = ctas(config);
  const reseller = config.contact.companyName;
  const premium = config.tier === "premium";

  return {
    vendorName: vendor.vendorName,
    productName: vendor.productName,
    resellerName: reseller,
    vendorTagline: vendor.vendorTagline,
    featuredVideo: vendor.videos?.[0],
    videoGallery: vendor.videos ?? [],
    isMock: true,
    hero: {
      eyebrow: `${vendor.productName} · delivered by ${reseller}`,
      headline: "Turn your people into your strongest defense",
      subheadline: `Engaging, story-driven ${vendor.productName.toLowerCase()} from ${vendor.vendorName}, delivered and supported by ${reseller}.`,
      primaryCta: c.primary,
      secondaryCta: c.secondary,
      aiCta: premium ? c.ai : undefined,
    },
    painMap: [
      {
        problem: "Human error",
        impact: "Most breaches start with a click",
        solution: "Behavior-changing training that sticks",
      },
      {
        problem: "Boring compliance training",
        impact: "Employees tune out and forget",
        solution: "Short, story-driven episodes people actually watch",
      },
      {
        problem: "Phishing exposure",
        impact: "Untested staff fall for real attacks",
        solution: "Adaptive phishing simulation and coaching",
      },
      {
        problem: "Unmeasured risk",
        impact: "No view of who is most vulnerable",
        solution: "Human-risk scoring that quantifies exposure",
      },
    ],
    capabilities: [
      { title: "Change behavior", outcome: "Story-driven episodes that stick" },
      { title: "Stay current", outcome: "Fresh content released every month" },
      { title: "Test readiness", outcome: "Adaptive phishing simulation" },
      { title: "Measure risk", outcome: "Quantified human-risk scoring" },
    ],
    whyBuyFromUs: {
      intro: `${vendor.vendorName} builds the platform. ${reseller} makes it work for you — and stays after the sale.`,
      services: config.services,
    },
    proof: {
      stats: [
        { value: "Monthly", label: "new episodes" },
        { value: "PHISH3D", label: "phishing simulation" },
        { value: "AWARE", label: "human-risk platform" },
      ],
      badges: [`${vendor.vendorName} Partner`, "AWARE", "SENSE", "PHISH3D"],
      testimonials: [
        {
          quote: `${reseller} made it easy to roll out ${vendor.productName} and prove it was working.`,
          author: reseller,
          role: "Delivery partner",
        },
      ],
    },
    roles: premium
      ? [
          {
            persona: "CISO/Security",
            label: "I manage cybersecurity",
            headline: "Shrink the human attack surface",
            points: [
              "Target training to each user's risk profile",
              "Simulate real phishing and coach in the moment",
              "Track human-risk reduction over time",
            ],
          },
          {
            persona: "CFO/Finance",
            label: "I care about budget",
            headline: "Lower risk, support insurance renewals",
            points: [
              "Reduce the odds of a costly breach",
              "Evidence for cyber-insurance requirements",
              "Predictable per-seat cost",
            ],
          },
          {
            persona: "Operations",
            label: "I run IT / operations",
            headline: "Rolls out fast, runs itself",
            points: [
              "Quick deployment and easy integration",
              "Automated assignments and reminders",
              "Compliance reporting out of the box",
            ],
          },
        ]
      : undefined,
    industries: premium
      ? config.industries.map((industry) => ({
          industry,
          headline: `${vendor.productName} for ${industry.toLowerCase()}`,
          points: [
            "Sector-specific scenarios and compliance",
            "Common attack patterns mapped to training",
            "Right-sized for lean teams",
          ],
        }))
      : undefined,
    contentFeed: [
      { title: `What's new in ${vendor.productName}`, kind: "Release", date: "This month" },
      { title: "Why story-driven training changes behavior", kind: "Article" },
      { title: "Building a human-risk program that lasts", kind: "Guide" },
      { title: "Live walkthrough: from rollout to results", kind: "Webinar" },
    ],
    nextQuarter: {
      label: "Q3 2026",
      feed: [
        { title: "New episode: “Deepfake Wire Fraud”", kind: "Episode", date: "Jul 2026" },
        { title: "New episode: “Quishing — QR Code Phishing”", kind: "Episode", date: "Aug 2026" },
        { title: "Threat advisory: AI voice-cloning attacks", kind: "Advisory", date: "Sep 2026" },
        { title: "Webinar: Designing a 2027 human-risk program", kind: "Webinar", date: "Sep 2026" },
      ],
      newCapability: {
        title: "AI-era threat coverage",
        outcome:
          "Fresh episodes on deepfakes, voice cloning, and AI-assisted phishing — added as new attack patterns emerge.",
      },
      statHighlight: { value: "+3", label: "new episodes this quarter" },
    },
    finalCta: {
      headline: "Let's map this to your team",
      button: c.final,
    },
    gaps: [],
  };
}

// ----------------------------------------------------------------------------
// TDE provider — grounded content from reconstruct().
// ----------------------------------------------------------------------------

interface EnrichmentJson {
  capabilities?: Array<
    string | { capability?: string; title?: string; outcome?: string; evidence?: string }
  >;
  differentiators?: Array<string | { differentiator?: string; proof?: string }>;
  proof_points?: Array<string | { type?: string; content?: string; source?: string }>;
  gaps?: string[];
}

/** Reconstruct with a JSON response; tolerates string-wrapped JSON. Null on failure. */
async function jsonReconstruct<T>(
  client: TdeClient,
  collectionId: string,
  query: string,
  maxAtoms = 18,
): Promise<T | null> {
  try {
    const res = await client.reconstruct<T>(collectionId, {
      intent: "custom",
      query,
      format: "json",
      max_atoms: maxAtoms,
    });
    const out = res.output as unknown;
    if (out && typeof out === "object") return out as T;
    if (typeof out === "string") {
      const cleaned = out.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      try {
        return JSON.parse(cleaned) as T;
      } catch {
        return null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

function capTitle(
  cap: string | { capability?: string; title?: string; outcome?: string },
): Capability {
  if (typeof cap === "string") return { title: cap, outcome: "" };
  return {
    title: cap.title ?? cap.capability ?? "",
    outcome: cap.outcome ?? "",
  };
}

interface HeroJson {
  headline?: string;
  subheadline?: string;
  stats?: Stat[];
}
interface PainJson {
  items?: PainPoint[];
}
interface RolesJson {
  roles?: Array<{ label?: string; headline?: string; points?: string[] }>;
}
interface IndustriesJson {
  industries?: IndustryView[];
}

const ROLE_PERSONAS: Array<{ persona: Persona; label: string }> = [
  { persona: "CISO/Security", label: "I manage cybersecurity" },
  { persona: "CFO/Finance", label: "I care about budget" },
  { persona: "Operations", label: "I run IT / operations" },
];

export async function tdeContent(
  config: ResellerConfig,
  vendor: VendorMapping,
): Promise<SubsiteContent> {
  const client = getTdeClient();
  if (!client) return mockContent(config, vendor);

  const base = mockContent(config, vendor);
  const reseller = config.contact.companyName;
  const product = `${vendor.productName} from ${vendor.vendorName}`;
  const diff = (vendor.differentiators ?? []).join("; ");
  const industries = config.industries.join(", ");

  const [enrichmentRes, hero, pain, roles, inds] = await Promise.all([
    client
      .reconstruct<EnrichmentJson>(vendor.collectionId, {
        intent: "enrichment",
        query: `Capabilities, differentiators, and proof points for ${product}`,
        format: "json",
        max_atoms: 20,
      })
      .then((r) => r.output ?? {})
      .catch(() => ({} as EnrichmentJson)),
    jsonReconstruct<HeroJson>(
      client,
      vendor.collectionId,
      `Return ONLY JSON {"headline": string (<=9 words, outcome-driven), "subheadline": string (<=32 words, says ${reseller} delivers ${product}), "stats": [{"value": string, "label": string}] exactly 3 items where value is a SHORT grounded token (a signature program name or cadence like "Monthly" or "PHISH3D") and NO invented numeric statistics}. Ground everything in atoms about ${vendor.vendorName}.`,
    ),
    jsonReconstruct<PainJson>(
      client,
      vendor.collectionId,
      `Return ONLY JSON {"items": [{"problem": string, "impact": string (<=12 words), "solution": string (<=18 words)}]} with exactly 4 items describing the human-risk, phishing, and compliance problems ${product} solves. Grounded in atoms; no invented numbers.`,
    ),
    jsonReconstruct<RolesJson>(
      client,
      vendor.collectionId,
      `Return ONLY JSON {"roles": [{"label": string, "headline": string (<=9 words), "points": [string,string,string]}]} with exactly 3 roles, in order, for: 1) a CISO/security leader, 2) a CFO/finance leader, 3) an IT/operations leader. Explain why ${product} matters to each. Grounded; no invented numbers.`,
    ),
    jsonReconstruct<IndustriesJson>(
      client,
      vendor.collectionId,
      `Return ONLY JSON {"industries": [{"industry": string, "headline": string (<=8 words), "points": [string,string,string]}]} for exactly these industries in order: ${industries}. How ${product} applies to each. Differentiators to weave in where relevant: ${diff}. Grounded.`,
    ),
  ]);

  const enrichment = enrichmentRes as EnrichmentJson;

  // Capabilities
  const capabilities =
    enrichment.capabilities && enrichment.capabilities.length
      ? enrichment.capabilities.slice(0, 6).map(capTitle).filter((c) => c.title)
      : base.capabilities;

  // Hero
  const heroContent: HeroContent = {
    ...base.hero,
    headline: hero?.headline?.trim() || base.hero.headline,
    subheadline: hero?.subheadline?.trim() || base.hero.subheadline,
  };

  // Pain map
  const painMap =
    pain?.items && pain.items.length ? pain.items.slice(0, 4) : base.painMap;

  // Roles (map model order to fixed personas)
  const roleViews: RoleView[] | undefined = config.tier === "premium"
    ? roles?.roles && roles.roles.length
      ? roles.roles.slice(0, 3).map((r, i) => ({
          persona: ROLE_PERSONAS[i]?.persona ?? "General",
          label: r.label ?? ROLE_PERSONAS[i]?.label ?? "Overview",
          headline: r.headline ?? "",
          points: (r.points ?? []).slice(0, 4),
        }))
      : base.roles
    : undefined;

  // Industries
  const industryViews: IndustryView[] | undefined = config.tier === "premium"
    ? inds?.industries && inds.industries.length
      ? inds.industries.slice(0, config.industries.length)
      : base.industries
    : undefined;

  // Proof: testimonial from a grounded proof point (attributed to the vendor).
  const proofPoints = enrichment.proof_points ?? [];
  const firstQuote = proofPoints
    .map((p) => (typeof p === "string" ? p : p.content))
    .find((t): t is string => Boolean(t && t.length > 20));
  const proof: ProofLayer = {
    stats: hero?.stats && hero.stats.length === 3 ? hero.stats : base.proof.stats,
    badges: base.proof.badges,
    testimonials: firstQuote
      ? [{ quote: firstQuote, author: vendor.vendorName, role: vendor.productName }]
      : base.proof.testimonials,
  };

  return {
    ...base,
    isMock: false,
    hero: heroContent,
    painMap,
    capabilities,
    proof,
    roles: roleViews,
    industries: industryViews,
    gaps: enrichment.gaps ?? [],
  };
}

// ----------------------------------------------------------------------------
// Entry point: cached in production, fresh in dev. Tagged for quarterly purge.
// ----------------------------------------------------------------------------

export async function getSubsiteContent(
  config: ResellerConfig,
  vendor: VendorMapping,
): Promise<SubsiteContent> {
  const client = getTdeClient();
  if (!client) return mockContent(config, vendor);

  const compute = () =>
    tdeContent(config, vendor).catch(() => mockContent(config, vendor));

  // In dev, skip the cache so prompt/content edits show immediately.
  if (process.env.NODE_ENV === "development") return compute();

  const cached = unstable_cache(compute, ["vsn-content", vendor.collectionId, config.id, config.tier], {
    revalidate: 1800,
    tags: [`vsn:content:${vendor.collectionId}`],
  });
  return cached();
}
