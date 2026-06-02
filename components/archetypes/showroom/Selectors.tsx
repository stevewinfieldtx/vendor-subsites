"use client";

/**
 * Premium interactive selectors. Role tabs map to TDE d_persona views; industry
 * tabs map to d_industry views. State is local; in a fuller build these would
 * trigger a server action to re-reconstruct copy for the chosen dimension.
 */
import { useState } from "react";
import type { IndustryView, RoleView } from "@/lib/content";

function TabList({
  labels,
  active,
  onSelect,
  ariaLabel,
}: {
  labels: string[];
  active: number;
  onSelect: (i: number) => void;
  ariaLabel: string;
}) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {labels.map((label, i) => {
        const isActive = i === active;
        return (
          <button
            key={label}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(i)}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{
              borderRadius: "999px",
              background: isActive ? "var(--vsn-primary)" : "transparent",
              color: isActive ? "#fff" : "var(--vsn-ink)",
              border: isActive
                ? "1px solid var(--vsn-primary)"
                : "1px solid color-mix(in oklab, var(--vsn-ink) 18%, transparent)",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function PointList({ headline, points }: { headline: string; points: string[] }) {
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-[1fr_1.4fr] sm:items-start">
      <h3 className="text-2xl font-semibold">{headline}</h3>
      <ul className="flex flex-col gap-3">
        {points.map((p) => (
          <li key={p} className="flex gap-3 text-base leading-relaxed">
            <span aria-hidden style={{ color: "var(--vsn-accent)" }}>
              ◆
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RoleSelector({ roles }: { roles: RoleView[] }) {
  const [active, setActive] = useState(0);
  const current = roles[active];
  return (
    <div>
      <TabList
        ariaLabel="Choose your role"
        labels={roles.map((r) => r.label)}
        active={active}
        onSelect={setActive}
      />
      <PointList headline={current.headline} points={current.points} />
    </div>
  );
}

export function IndustrySelector({ industries }: { industries: IndustryView[] }) {
  const [active, setActive] = useState(0);
  const current = industries[active];
  return (
    <div>
      <TabList
        ariaLabel="Choose your industry"
        labels={industries.map((v) => v.industry)}
        active={active}
        onSelect={setActive}
      />
      <PointList headline={current.headline} points={current.points} />
    </div>
  );
}
