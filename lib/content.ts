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
import { getTdeClient, type Persona } from "./tde";
import type { ResellerConfig, VendorMapping } from "./tenant";

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
  /** Premium: opens the AI advisor. */
  aiCta?: Cta;
}

export interface PainPoint {
  problem: string;
  impact: string;
  solution: string;
}

export interface Capability {
  title: string;
  /** Outcome-framed, not a feature dump. */
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

/** Premium: a persona-tailored view (maps to TDE d_persona). */
export interface RoleView {
  persona: Persona;
  label: string;
  headline: string;
  points: string[];
}

/** Premium: an industry-tailored view (maps to TDE d_industry). */
export interface IndustryView {
  industry: string;
  headline: string;
  points: string[];
}

export interface FeedItem {
  title: string;
  kind: "Release" | "Article" | "Advisory" | "Webinar" | "Guide";
  date?: string;
  href?: string;
}

export interface SubsiteContent {
  vendorName: string;
  productName: string;
  resellerName: string;
  hero: HeroContent;
  painMap: PainPoint[];
  capabilities: Capability[];
  whyBuyFromUs: WhyBuyFromUs;
  proof: ProofLayer;
  /** Premium only. */
  roles?: RoleView[];
  /** Premium only. */
  industries?: IndustryView[];
  contentFeed: FeedItem[];
  finalCta: { headline: string; button: Cta };
  /** Surfaced from reconstruct() gaps — what content to ingest next. */
  gaps?: string[];
  /** True when served from mock (no live TDE). */
  isMock: boolean;
}

// ----------------------------------------------------------------------------
// Shared CTA helpers (consistent across both providers)
// ----------------------------------------------------------------------------

function ctas(config: ResellerConfig, vendor: VendorMapping) {
  const book = config.contact.calendarUrl ?? "#contact";
  return {
    primary: { label: "Talk to an expert", href: book } as Cta,
    secondary: { label: "Explore the solution", href: "#solution" } as Cta,
    ai: { label: "Ask the AI advisor", href: "#advisor" } as Cta,
    final: { label: "Map this to your environment", href: book } as Cta,
    _vendor: vendor,
  };
}

// ----------------------------------------------------------------------------
// Mock provider — realistic stand-in until TDE is connected.
// ----------------------------------------------------------------------------

export function mockContent(
  config: ResellerConfig,
  vendor: VendorMapping,
): SubsiteContent {
  const c = ctas(config, vendor);
  const reseller = config.contact.companyName;
  const premium = config.tier === "premium";

  return {
    vendorName: vendor.vendorName,
    productName: vendor.productName,
    resellerName: reseller,
    isMock: true,
    hero: {
      eyebrow: `${vendor.productName} · delivered by ${reseller}`,
      headline: "Security that closes the gaps attackers count on",
      subheadline: `Protect users, devices, and cloud workloads with enterprise-grade ${vendor.productName.toLowerCase()}, deployed and supported by ${reseller}.`,
      primaryCta: c.primary,
      secondaryCta: c.secondary,
      aiCta: premium ? c.ai : undefined,
    },
    painMap: [
      {
        problem: "Alert fatigue",
        impact: "Real threats slip past overwhelmed teams",
        solution: "Correlates and prioritizes the events that actually matter",
      },
      {
        problem: "Slow response",
        impact: "Incidents expand before anyone acts",
        solution: "Automated detection with guided, around-the-clock response",
      },
      {
        problem: "Tool sprawl",
        impact: "Budget and attention spread too thin",
        solution: "Consolidates visibility and workflows into one pane",
      },
      {
        problem: "Compliance pressure",
        impact: "Audits and insurance renewals become painful",
        solution: "Reporting, control mapping, and evidence on demand",
      },
    ],
    capabilities: [
      { title: "Detect faster", outcome: "Threats surfaced in minutes, not days" },
      { title: "Investigate less", outcome: "Automated triage cuts manual review" },
      { title: "Report easily", outcome: "Audit-ready evidence without the scramble" },
      { title: "Respond together", outcome: "Coordinated action across your stack" },
    ],
    whyBuyFromUs: {
      intro: `${vendor.vendorName} builds the platform. ${reseller} makes it work for you — and stays after the sale.`,
      services: config.services,
    },
    proof: {
      stats: [
        { value: "24/7", label: "monitoring & response" },
        { value: "15 min", label: "median time to triage" },
        { value: "200+", label: "environments supported" },
      ],
      badges: [`${vendor.vendorName} Certified Partner`, "SOC 2 aligned", "Microsoft Solutions Partner"],
      testimonials: [
        {
          quote: `${reseller} stood up ${vendor.productName} in weeks and gave us evidence our cyber-insurer actually accepted.`,
          author: "Director of IT",
          role: "Regional health system",
        },
      ],
    },
    roles: premium
      ? [
          {
            persona: "CFO/Finance",
            label: "I care about budget",
            headline: "Predictable spend, measurable risk reduction",
            points: [
              "Consolidate overlapping tools into one line item",
              "Lower cyber-insurance premiums with stronger evidence",
              "Avoid the six-figure cost of unplanned downtime",
            ],
          },
          {
            persona: "CISO/Security",
            label: "I manage cybersecurity",
            headline: "Coverage, visibility, and faster response",
            points: [
              "Full telemetry across endpoint, identity, and cloud",
              "Guided response that shortens dwell time",
              "Threat coverage mapped to MITRE ATT&CK",
            ],
          },
          {
            persona: "CTO/IT",
            label: "I lead IT",
            headline: "Deployed and managed without adding headcount",
            points: [
              "We handle rollout, tuning, and day-2 operations",
              "Integrates with your existing Microsoft stack",
              "One escalation path — to us, not a vendor queue",
            ],
          },
        ]
      : undefined,
    industries: premium
      ? config.industries.map((industry) => ({
          industry,
          headline: `${vendor.productName} for ${industry.toLowerCase()}`,
          points: [
            "Sector-specific compliance and reporting",
            "Common attack scenarios mapped to defenses",
            "Right-sized for lean internal teams",
          ],
        }))
      : undefined,
    contentFeed: [
      { title: `What's new in ${vendor.productName}`, kind: "Release", date: "This quarter" },
      { title: "Is your environment ready for an insurance audit?", kind: "Guide" },
      { title: "Ransomware in manufacturing: a 2026 field view", kind: "Article" },
      { title: "Live walkthrough: detection to response in 15 minutes", kind: "Webinar" },
    ],
    finalCta: {
      headline: "Let's map this to your environment",
      button: c.final,
    },
    gaps: [],
  };
}

// ----------------------------------------------------------------------------
// TDE provider — grounded, voiced content from reconstruct().
// ----------------------------------------------------------------------------

interface EnrichmentJson {
  capabilities?: Array<string | { title?: string; outcome?: string }>;
  differentiators?: string[];
  proof_points?: string[];
  gaps?: string[];
}

/**
 * Build content from TDE. Uses `enrichment` (structured JSON) for capabilities
 * and proof, and voice-aware `custom` reconstructs for hero/positioning so copy
 * matches the reseller's tone. Each section falls back to the mock on failure,
 * so a partial TDE outage never blanks the page.
 */
export async function tdeContent(
  config: ResellerConfig,
  vendor: VendorMapping,
): Promise<SubsiteContent> {
  const client = getTdeClient();
  if (!client) return mockContent(config, vendor);

  const base = mockContent(config, vendor); // section-level fallback source
  const industryHint = config.industries[0];

  // Enrichment: capabilities + differentiators + proof + gaps.
  let enrichment: EnrichmentJson = {};
  try {
    const res = await client.reconstruct<EnrichmentJson>(vendor.collectionId, {
      intent: "enrichment",
      query: `Capabilities, differentiators, and proof points for ${vendor.productName} relevant to ${industryHint}`,
      format: "json",
      filters: { d_industry: industryHint },
      max_atoms: 20,
    });
    enrichment = res.output ?? {};
  } catch {
    // keep mock-derived sections
  }

  const capabilities: Capability[] =
    enrichment.capabilities && enrichment.capabilities.length > 0
      ? enrichment.capabilities.slice(0, 6).map((cap) =>
          typeof cap === "string"
            ? { title: cap, outcome: "" }
            : { title: cap.title ?? "", outcome: cap.outcome ?? "" },
        )
      : base.capabilities;

  // Voiced hero subheadline (custom intent → injects voice cascade).
  let heroSub = base.hero.subheadline;
  try {
    const res = await client.reconstruct(vendor.collectionId, {
      intent: "custom",
      query: `Write a one-sentence hero subheadline for a landing page where ${config.contact.companyName} resells ${vendor.productName}. Outcome-focused, in our brand voice. No quotes.`,
      filters: { buying_stage: "Interest" },
      max_words: 45,
    });
    if (typeof res.output === "string" && res.output.trim()) {
      heroSub = res.output.trim();
    }
  } catch {
    // keep mock subheadline
  }

  return {
    ...base,
    isMock: false,
    hero: { ...base.hero, subheadline: heroSub },
    capabilities,
    gaps: enrichment.gaps ?? [],
  };
}

/** Entry point used by pages. Picks TDE when configured, else mock. */
export async function getSubsiteContent(
  config: ResellerConfig,
  vendor: VendorMapping,
): Promise<SubsiteContent> {
  const client = getTdeClient();
  if (!client) return mockContent(config, vendor);
  try {
    return await tdeContent(config, vendor);
  } catch {
    return mockContent(config, vendor);
  }
}
