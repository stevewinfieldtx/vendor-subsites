"use client";

/**
 * Interactive "always current" demo. A visitor clicks "Show next quarter's
 * updates" and the page's content feed visibly refreshes to a future cycle —
 * new episodes, advisories, a new capability, a refreshed benchmark — with a
 * "no one touched this page" payoff. Demonstrates the platform's auto-update
 * value prop without any manual maintenance.
 */
import { useState } from "react";
import type { CSSProperties } from "react";
import type { FeedItem, QuarterlyUpdate } from "@/lib/content";
import { Badge, Card, Container, Section, SectionHeading } from "@/components/ui";

function FeedCard({
  item,
  isNew,
  i,
}: {
  item: FeedItem;
  isNew: boolean;
  i: number;
}) {
  const delay: CSSProperties = { animationDelay: `${i * 70}ms` };
  return (
    <div
      className="vsn-reveal group relative flex flex-col p-5"
      style={{
        ...delay,
        background: "var(--vsn-surface)",
        borderRadius: "var(--vsn-radius)",
        border: "1px solid color-mix(in oklab, var(--vsn-ink) 8%, transparent)",
      }}
    >
      {isNew ? (
        <span
          className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
          style={{ background: "var(--vsn-accent)", color: "#06121d" }}
        >
          New
        </span>
      ) : null}
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--vsn-accent)" }}
      >
        {item.kind}
      </span>
      <span className="mt-2 flex-1 text-base font-medium leading-snug">
        {item.title}
      </span>
      {item.date ? (
        <span className="mt-3 text-xs" style={{ color: "var(--vsn-ink-muted)" }}>
          {item.date}
        </span>
      ) : null}
    </div>
  );
}

export function QuarterlyDemo({
  feed,
  next,
  vendorName,
}: {
  feed: FeedItem[];
  next?: QuarterlyUpdate;
  vendorName: string;
}) {
  const [showNext, setShowNext] = useState(false);
  const live = showNext && next ? next.feed : feed;

  return (
    <Section id="updates" alt>
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Always current"
            title="Updated from the source"
            lead="New releases and guidance flow in automatically — you never maintain this page."
          />
          {next ? (
            <button
              type="button"
              onClick={() => setShowNext((v) => !v)}
              className="inline-flex shrink-0 items-center gap-2 px-5 py-3 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5"
              style={{
                background: showNext ? "transparent" : "var(--vsn-primary)",
                color: showNext ? "var(--vsn-ink)" : "#fff",
                border: showNext
                  ? "1px solid color-mix(in oklab, var(--vsn-ink) 22%, transparent)"
                  : "1px solid transparent",
                borderRadius: "var(--vsn-radius)",
              }}
            >
              {showNext ? "← Back to today" : `▶ Show ${next.label} updates`}
            </button>
          ) : null}
        </div>

        {showNext && next ? (
          <div
            key="banner"
            className="vsn-reveal mt-7 flex items-center gap-3 p-4"
            style={{
              background: "color-mix(in oklab, var(--vsn-primary) 10%, var(--vsn-surface))",
              border: "1px solid color-mix(in oklab, var(--vsn-primary) 25%, transparent)",
              borderRadius: "var(--vsn-radius)",
            }}
          >
            <span
              aria-hidden
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm"
              style={{ background: "var(--vsn-primary)", color: "#fff" }}
            >
              ✓
            </span>
            <p className="text-sm leading-snug">
              <strong>Auto-refreshed from {vendorName} — {next.label}.</strong>{" "}
              <span style={{ color: "var(--vsn-ink-muted)" }}>
                No one touched this page. New content flowed straight from the source.
              </span>
            </p>
          </div>
        ) : null}

        {/* key forces the entrance animation to replay on each toggle */}
        <div
          key={showNext ? "next" : "now"}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {live.map((item, i) => (
            <FeedCard key={item.title} item={item} isNew={showNext} i={i} />
          ))}
        </div>

        {showNext && next ? (
          <div key="breadth" className="mt-4 grid gap-4 sm:grid-cols-2">
            <Card
              className="vsn-reveal"
              style={{ animationDelay: "320ms" }}
            >
              <div className="flex items-center gap-2">
                <Badge>New capability</Badge>
                <span className="text-[11px] uppercase tracking-wide" style={{ color: "var(--vsn-ink-muted)" }}>
                  added automatically
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold">{next.newCapability.title}</h3>
              <p className="mt-1.5 text-sm" style={{ color: "var(--vsn-ink-muted)" }}>
                {next.newCapability.outcome}
              </p>
            </Card>
            <Card
              className="vsn-reveal flex flex-col items-start justify-center"
              style={{ animationDelay: "400ms" }}
            >
              <div
                className="vsn-display text-4xl font-bold"
                style={{ color: "var(--vsn-primary)" }}
              >
                {next.statHighlight.value}
              </div>
              <div className="mt-1 text-sm" style={{ color: "var(--vsn-ink-muted)" }}>
                {next.statHighlight.label} — and your phishing benchmark refreshed too.
              </div>
            </Card>
          </div>
        ) : null}
      </Container>
    </Section>
  );
}
