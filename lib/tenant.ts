/**
 * Reseller (tenant) configuration.
 *
 * The whole platform is ONE multi-tenant app. A reseller is a config record:
 * brand tokens + chosen vendors + tier + archetype. The app resolves the tenant
 * by hostname (subdomain / reverse-proxy tiers) or by an embed key (widget tier),
 * loads this config, and renders. Adding a reseller = adding a config record.
 *
 * Phase 1 ships a single hard-coded flagship config. Phase 2 loads these from
 * Railway Postgres, but the shape stays the same.
 */

import type { ArchetypeId } from "./theme";

export type ProductTier = "standard" | "premium";

/** How the subsite attaches to the reseller's web presence. */
export type IntegrationTier =
  | "embed" // A — paste a <script>/iframe, identified by embed key
  | "subdomain" // B — solutions.reseller.com via CNAME, identified by host
  | "proxy"; // C — reseller.com/solutions/* via reverse proxy

export interface BrandTokens {
  /** Primary brand color (hex). Drives CTAs, accents. */
  primary: string;
  /** Secondary / supporting color. */
  secondary: string;
  /** Optional dark accent for text-heavy surfaces. */
  accent?: string;
  /** Logo URL (the reseller's own logo). */
  logoUrl?: string;
  /** Heading font family (CSS value). Falls back to archetype default. */
  headingFont?: string;
  /** Body font family (CSS value). Falls back to archetype default. */
  bodyFont?: string;
}

export interface ResellerContact {
  companyName: string;
  phone?: string;
  email?: string;
  /** Scheduling link used by "Book a consultation" CTAs. */
  calendarUrl?: string;
}

/** A showcase video (e.g. a sample episode) — the product's hero demo. */
export interface VendorVideo {
  /** YouTube video id. */
  id: string;
  title: string;
  /** Short context line, e.g. "Featuring Jon Lovitz". */
  note?: string;
}

/**
 * A vendor/product the reseller sells. `collectionId` is the TDE collection
 * holding that product's 9D atoms; page copy is reconstructed from it.
 */
export interface VendorMapping {
  /** URL slug, e.g. "endpoint-security". */
  slug: string;
  vendorName: string;
  productName: string;
  /** A one-line statement of what makes this product distinctive. */
  vendorTagline?: string;
  /** TDE collection id for this product's atoms. */
  collectionId: string;
  /** Reseller's positioning slant — fed into reconstruct() to differentiate. */
  differentiators?: string[];
  /** Showcase videos (sample episodes). First is featured in the hero. */
  videos?: VendorVideo[];
}

export interface ResellerConfig {
  /** Stable internal id. */
  id: string;
  /** Hostname for subdomain/proxy tiers, e.g. "solutions.acme.com". */
  host?: string;
  /** Embed key for the widget tier. */
  embedKey?: string;

  tier: ProductTier;
  integration: IntegrationTier;
  archetype: ArchetypeId;

  brand: BrandTokens;
  contact: ResellerContact;

  /** Industries this reseller targets — sets reconstruct() industry emphasis. */
  industries: string[];
  /** Value-add services — power the "Why buy from us" section. */
  services: string[];
  regions?: string[];

  vendors: VendorMapping[];

  /**
   * TDE collection holding the reseller's OWN content (their site crawl), from
   * which CPPV voice is built. Reconstruct calls reference this for voice when
   * supported; otherwise the vendor collection's voice cascade is used.
   */
  voiceCollectionId?: string;
}

// ----------------------------------------------------------------------------
// Phase 1 flagship: NINJIO (vendor) delivered by Rain Networks (reseller).
//
// Brand tokens are Rain Networks' real palette + font (extracted from their
// Squarespace theme): accent blue hsl(204 79% 38%), light-blue secondary accent,
// near-black hero, Poppins. Vendor content comes from the TDE collection
// "ninjio.com" (3,400+ atoms). Reseller voice collection: "rainnetworks.com".
// ----------------------------------------------------------------------------

export const FLAGSHIP_CONFIG: ResellerConfig = {
  id: "rain-networks",
  host: "localhost:3000",
  embedKey: "rain-ninjio",
  tier: "premium",
  integration: "subdomain",
  archetype: "showroom",
  brand: {
    primary: "hsl(204 79% 38%)",
    secondary: "#0b0c0e",
    accent: "hsl(209 53% 64%)",
    logoUrl:
      "https://images.squarespace-cdn.com/content/v1/640dd2ad47fe32613a472b9c/752a13a6-fda8-4d37-9fb8-ba7cecc4cbda/Rain+Logo+on+White+BG.png?format=750w",
    headingFont: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif",
    bodyFont: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif",
  },
  contact: {
    companyName: "Rain Networks",
    email: "sales@rainnetworks.com",
    calendarUrl: "https://rainnetworks.com/contact",
  },
  industries: ["Managed Service Providers", "Healthcare", "Financial Services"],
  services: [
    "Licensing & procurement",
    "Partner onboarding & enablement",
    "Technical pre-sales support",
    "Deployment & rollout guidance",
    "Consolidated billing",
    "Dedicated account management",
  ],
  regions: ["United States"],
  vendors: [
    {
      slug: "ninjio",
      vendorName: "NINJIO",
      productName: "Security Awareness Training",
      vendorTagline:
        "Hollywood-produced, 3–4 minute animated episodes that employees actually want to watch.",
      collectionId: "ninjio.com",
      differentiators: [
        "Personalization based on each user's emotional susceptibility, not generic compliance",
        "Story-driven microlearning with fresh episodes every month",
        "Human-risk scoring plus PHISH3D phishing simulation",
      ],
      videos: [
        {
          id: "nVzPraG-Nzc",
          title: "Working From Home",
          note: "Featuring actor Jon Lovitz",
        },
        { id: "ukTK3IUkG_o", title: "E812 — All Bets Are Off", note: "Sample episode" },
        { id: "UwVBau7om0o", title: "Why NINJIO Works", note: "Overview" },
      ],
    },
  ],
  voiceCollectionId: "rainnetworks.com",
};

/** Resolve a tenant. Phase 1: always the flagship. Phase 2: DB lookup. */
export function resolveTenant(_host?: string, _embedKey?: string): ResellerConfig {
  return FLAGSHIP_CONFIG;
}

/** Find a vendor mapping within a config by slug. */
export function findVendor(
  config: ResellerConfig,
  slug: string,
): VendorMapping | undefined {
  return config.vendors.find((v) => v.slug === slug);
}
