/**
 * Shared, brand-token-driven UI primitives used across archetypes.
 * Server-safe (no client hooks). Every color comes from a --vsn-* variable.
 */
import type { CSSProperties, ReactNode } from "react";
import type { Cta } from "@/lib/content";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-6 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Section({
  id,
  children,
  alt = false,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  alt?: boolean;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 ${className}`}
      style={{
        paddingTop: "var(--vsn-section-space)",
        paddingBottom: "var(--vsn-section-space)",
        background: alt ? "var(--vsn-surface-alt)" : "transparent",
      }}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-block text-xs font-semibold uppercase tracking-[0.18em]"
      style={{ color: "var(--vsn-ink-muted)" }}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`flex flex-col gap-4 ${
        align === "center" ? "items-center text-center mx-auto max-w-2xl" : "max-w-2xl"
      }`}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="text-3xl sm:text-4xl font-semibold">{title}</h2>
      {lead ? (
        <p className="text-lg leading-relaxed" style={{ color: "var(--vsn-ink-muted)" }}>
          {lead}
        </p>
      ) : null}
    </div>
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost";

const BUTTON_STYLE: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: "var(--vsn-primary)",
    color: "#fff",
    borderRadius: "var(--vsn-radius)",
  },
  secondary: {
    background: "transparent",
    color: "var(--vsn-ink)",
    border: "1px solid color-mix(in oklab, var(--vsn-ink) 22%, transparent)",
    borderRadius: "var(--vsn-radius)",
  },
  ghost: {
    background: "transparent",
    color: "var(--vsn-primary)",
  },
};

export function Button({
  cta,
  variant = "primary",
  className = "",
}: {
  cta: Cta;
  variant?: ButtonVariant;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition-transform duration-200 will-change-transform hover:-translate-y-0.5";
  return (
    <a href={cta.href} className={`${base} ${className}`} style={BUTTON_STYLE[variant]}>
      {cta.label}
      {variant !== "ghost" ? <span aria-hidden>→</span> : null}
    </a>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
      style={{
        background: "color-mix(in oklab, var(--vsn-primary) 8%, var(--vsn-surface))",
        color: "var(--vsn-ink)",
        border: "1px solid color-mix(in oklab, var(--vsn-primary) 18%, transparent)",
        borderRadius: "999px",
      }}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`p-6 sm:p-7 ${className}`}
      style={{
        background: "var(--vsn-surface)",
        border: "1px solid color-mix(in oklab, var(--vsn-ink) 10%, transparent)",
        borderRadius: "var(--vsn-radius)",
        boxShadow:
          "0 1px 2px color-mix(in oklab, var(--vsn-ink) 6%, transparent), 0 12px 30px -18px color-mix(in oklab, var(--vsn-ink) 28%, transparent)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
