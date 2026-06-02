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

/**
 * A vendor/product the reseller sells. `collectionId` is the TDE collection
 * holding that product's 9D atoms; page copy is reconstructed from it.
 */
export interface VendorMapping {
  /** URL slug, e.g. "endpoint-security". */
  slug: string;
  vendorName: string;
  productName: string;
  /** TDE collection id for this product's atoms. */
  collectionId: string;
  /** Reseller's positioning slant — fed into reconstruct() to differentiate. */
  differentiators?: string[];
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
// Phase 1 flagship config (PLACEHOLDER).
//
// TODO(flagship): replace with the real vendor + reseller pairing once chosen.
// Values below are realistic stand-ins (a cybersecurity VAR reselling an MDR
// platform) so the app renders end-to-end before live data is wired.
// ----------------------------------------------------------------------------

export const FLAGSHIP_CONFIG: ResellerConfig = {
  id: "flagship",
  host: "localhost:3000",
  embedKey: "flagship-demo",
  tier: "premium",
  integration: "subdomain",
  archetype: "showroom",
  brand: {
    primary: "#1d4ed8",
    secondary: "#0f172a",
    accent: "#38bdf8",
    headingFont: undefined,
    bodyFont: undefined,
  },
  contact: {
    companyName: "Northpoint Technology Partners",
    phone: "(555) 014-2200",
    email: "solutions@northpointtech.example",
    calendarUrl: "https://cal.example/northpoint",
  },
  industries: ["Health Care & Social Assistance", "Manufacturing", "Finance & Insurance"],
  services: [
    "Environment assessment & licensing guidance",
    "Deployment & configuration",
    "Integration & migration",
    "Team training",
    "Managed detection & response",
    "Quarterly business reviews",
  ],
  regions: ["Pacific Northwest", "Mountain West"],
  vendors: [
    {
      slug: "managed-detection-response",
      vendorName: "Vendor MDR",
      productName: "Managed Detection & Response",
      collectionId: "flagship-mdr",
      differentiators: [
        "24/7 monitoring backed by a local engineering team",
        "Cyber-insurance evidence packages",
        "Microsoft-environment-first integration",
      ],
    },
  ],
  voiceCollectionId: "flagship-northpoint-voice",
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
