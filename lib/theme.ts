/**
 * Theme system: design tokens emitted as CSS custom properties.
 *
 * Two layers compose, so two resellers selling the same vendor never look alike:
 *   1. Archetype preset  — one of six layout/design languages (structure, density,
 *      radius, default fonts). Selected per reseller.
 *   2. Brand tokens      — the reseller's own colors/fonts/logo, overriding the
 *      preset's neutral defaults.
 *
 * The merged result is a flat map of `--vsn-*` variables applied to the subsite
 * root, so every component styles itself from variables (no hard-coded colors).
 *
 * Phase 1 fully implements the "showroom" archetype; the other five ids exist so
 * configs and types are stable, and their layouts land in Phase 3.
 */

import type { CSSProperties } from "react";
import type { BrandTokens } from "./tenant";

export type ArchetypeId =
  | "editorial" // bold, large type, magazine rhythm
  | "corporate" // clean enterprise, restrained, grid-driven
  | "showroom" // interactive, product-forward, spacious
  | "minimal" // conversion-minimal, few sections, big CTAs
  | "technical" // spec-forward, dense, mono accents
  | "relationship"; // warm, human, photography-led

export interface ArchetypePreset {
  id: ArchetypeId;
  label: string;
  /** Corner radius scale (px) for cards/buttons. */
  radius: number;
  /** Vertical rhythm multiplier for section spacing. */
  density: "compact" | "comfortable" | "spacious";
  /** Neutral fallback fonts when the brand supplies none. */
  headingFont: string;
  bodyFont: string;
  /** Default neutral surface + ink, brand colors layer on top. */
  surface: string;
  surfaceAlt: string;
  ink: string;
  inkMuted: string;
}

const SANS =
  "var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
const MONO =
  "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace";
const DISPLAY = "var(--font-display), Georgia, 'Times New Roman', serif";

export const ARCHETYPES: Record<ArchetypeId, ArchetypePreset> = {
  editorial: {
    id: "editorial",
    label: "Editorial",
    radius: 4,
    density: "spacious",
    headingFont: SANS,
    bodyFont: SANS,
    surface: "#ffffff",
    surfaceAlt: "#f6f5f2",
    ink: "#14110e",
    inkMuted: "#5b554d",
  },
  corporate: {
    id: "corporate",
    label: "Enterprise",
    radius: 8,
    density: "comfortable",
    headingFont: SANS,
    bodyFont: SANS,
    surface: "#ffffff",
    surfaceAlt: "#f1f5f9",
    ink: "#0f172a",
    inkMuted: "#475569",
  },
  showroom: {
    id: "showroom",
    label: "Showroom",
    radius: 16,
    density: "spacious",
    headingFont: DISPLAY,
    bodyFont: SANS,
    surface: "#ffffff",
    surfaceAlt: "#f8fafc",
    ink: "#0b1120",
    inkMuted: "#475569",
  },
  minimal: {
    id: "minimal",
    label: "Conversion-minimal",
    radius: 10,
    density: "comfortable",
    headingFont: SANS,
    bodyFont: SANS,
    surface: "#ffffff",
    surfaceAlt: "#fafafa",
    ink: "#111111",
    inkMuted: "#666666",
  },
  technical: {
    id: "technical",
    label: "Technical",
    radius: 6,
    density: "compact",
    headingFont: SANS,
    bodyFont: MONO,
    surface: "#0b0e14",
    surfaceAlt: "#11161f",
    ink: "#e6edf3",
    inkMuted: "#9aa4b2",
  },
  relationship: {
    id: "relationship",
    label: "Relationship",
    radius: 20,
    density: "comfortable",
    headingFont: SANS,
    bodyFont: SANS,
    surface: "#fffdf9",
    surfaceAlt: "#f5efe6",
    ink: "#1f1a15",
    inkMuted: "#6b6256",
  },
};

const DENSITY_SPACE: Record<ArchetypePreset["density"], string> = {
  compact: "3.5rem",
  comfortable: "5rem",
  spacious: "7rem",
};

/**
 * Compose archetype preset + brand tokens into a flat CSS-variable map.
 * Apply to the subsite root element via `style={themeStyle(config)}`.
 */
export function buildThemeVars(
  archetype: ArchetypeId,
  brand: BrandTokens,
): Record<string, string> {
  const preset = ARCHETYPES[archetype] ?? ARCHETYPES.showroom;
  return {
    "--vsn-primary": brand.primary,
    "--vsn-secondary": brand.secondary,
    "--vsn-accent": brand.accent ?? brand.primary,
    "--vsn-surface": preset.surface,
    "--vsn-surface-alt": preset.surfaceAlt,
    "--vsn-ink": preset.ink,
    "--vsn-ink-muted": preset.inkMuted,
    "--vsn-radius": `${preset.radius}px`,
    "--vsn-section-space": DENSITY_SPACE[preset.density],
    "--vsn-font-heading": brand.headingFont ?? preset.headingFont,
    "--vsn-font-body": brand.bodyFont ?? preset.bodyFont,
  };
}

/** React style object for the subsite root. Cast keeps TS happy for CSS vars. */
export function themeStyle(
  archetype: ArchetypeId,
  brand: BrandTokens,
): CSSProperties {
  return buildThemeVars(archetype, brand) as CSSProperties;
}
