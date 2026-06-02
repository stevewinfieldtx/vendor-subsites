"use client";

/**
 * "Showroom" archetype — refined, spacious, product-forward. Renders a Premium
 * subsite from SubsiteContent + the resolved theme.
 *
 * Demo control: a red bar at the very top (visually NOT part of the site) toggles
 * a simulated quarterly refresh. Only CENTRALLY-CONTROLLED vendor content
 * (hero positioning, program stats, capabilities, pain map, resource feed) swaps
 * and gets highlighted. Partner-added content (branding, "Why us" services, CTAs,
 * contact) never changes — that's the point of the mock-up.
 */
import { useState } from "react";
import type { CSSProperties } from "react";
import { themeStyle } from "@/lib/theme";
import type { ResellerConfig, VendorMapping } from "@/lib/tenant";
import type { SubsiteContent, QuarterlyUpdate } from "@/lib/content";
import {
  Badge,
  Button,
  Card,
  Container,
  Section,
  SectionHeading,
} from "@/components/ui";
import { IndustrySelector, RoleSelector } from "./Selectors";
import { VideoShowcase } from "./VideoShowcase";
import { Advisor } from "@/components/advisor/Advisor";

// ---------------------------------------------------------------------------
// Demo refresh: merge the simulated quarter over live content + diff helpers.
// ---------------------------------------------------------------------------

function applyQuarter(c: SubsiteContent, nq: QuarterlyUpdate): SubsiteContent {
  return {
    ...c,
    hero: {
      ...c.hero,
      headline: nq.headline ?? c.hero.headline,
      subheadline: nq.subheadline ?? c.hero.subheadline,
    },
    proof: nq.stats ? { ...c.proof, stats: nq.stats } : c.proof,
    capabilities: nq.capabilities ?? c.capabilities,
    painMap: nq.painMap ?? c.painMap,
    contentFeed: nq.feed ?? c.contentFeed,
  };
}

/** True when `updated` and the two values differ — i.e. this field just refreshed. */
function changed(updated: boolean, a: unknown, b: unknown): boolean {
  return updated && JSON.stringify(a) !== JSON.stringify(b);
}

const HL_TEXT: CSSProperties = {
  background: "#fde047",
  borderRadius: "4px",
  padding: "0 0.12em",
  boxDecorationBreak: "clone",
  WebkitBoxDecorationBreak: "clone",
};
const HL_BOX: CSSProperties = {
  background: "#fefce8",
  outline: "2px dashed #dc2626",
  outlineOffset: "3px",
};
const tHL = (on: boolean): CSSProperties => (on ? HL_TEXT : {});
const bHL = (on: boolean): CSSProperties => (on ? HL_BOX : {});

// ---------------------------------------------------------------------------

export function ShowroomSubsite({
  config,
  vendor,
  content,
}: {
  config: ResellerConfig;
  vendor: VendorMapping;
  content: SubsiteContent;
}) {
  const premium = config.tier === "premium";
  const rootStyle = themeStyle(config.archetype, config.brand);

  const nq = content.nextQuarter;
  const [updated, setUpdated] = useState(false);
  const live = updated && nq ? applyQuarter(content, nq) : content;

  return (
    <div className="vsn-root flex min-h-full flex-col" style={rootStyle}>
      {nq ? (
        <DemoBar
          updated={updated}
          label={nq.label}
          onToggle={() => setUpdated((v) => !v)}
        />
      ) : null}

      <Nav content={live} config={config} stickyTop={nq ? "2.75rem" : "0px"} />

      <Hero content={live} prev={content} premium={premium} updated={updated} />

      <PainMap content={live} prev={content} updated={updated} />

      <VideoGallery content={live} />

      <Capabilities content={live} prev={content} updated={updated} />

      {premium && live.roles?.length ? (
        <Section id="roles" alt>
          <Container>
            <SectionHeading
              eyebrow="Built for your seat"
              title="See it from where you sit"
              lead="The same platform reads differently depending on what you own. Pick your role."
            />
            <div className="mt-10">
              <RoleSelector roles={live.roles} />
            </div>
          </Container>
        </Section>
      ) : null}

      {premium && live.industries?.length ? (
        <Section id="industries">
          <Container>
            <SectionHeading
              eyebrow="Your world"
              title="Tuned to your industry"
              lead="Compliance, threats, and constraints differ by sector. Choose yours."
            />
            <div className="mt-10">
              <IndustrySelector industries={live.industries} />
            </div>
          </Container>
        </Section>
      ) : null}

      {/* Partner-added — never changes on refresh. */}
      <WhyBuyFromUs content={content} />

      <Proof content={content} />

      <Resources content={live} prev={content} updated={updated} />

      <FinalCta content={content} />

      <Footer content={content} config={config} />

      {premium ? (
        <Advisor
          collections={vendor.collectionId}
          productName={content.productName}
          resellerName={content.resellerName}
        />
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Demo control bar — deliberately NOT styled like the site.
// ---------------------------------------------------------------------------

function DemoBar({
  updated,
  label,
  onToggle,
}: {
  updated: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <div
      className="sticky top-0 z-50 flex h-11 items-center justify-between gap-3 px-4"
      style={{
        background: "#dc2626",
        color: "#fff",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <span className="flex items-center gap-2 text-xs font-semibold sm:text-sm">
        <span aria-hidden className="text-[10px]">
          ●
        </span>
        DEMO MOCK-UP — control panel, not part of the live site
        {updated ? (
          <span className="hidden font-normal opacity-90 md:inline">
            · showing {label} (highlighted = centrally updated)
          </span>
        ) : null}
      </span>
      <button
        type="button"
        onClick={onToggle}
        className="shrink-0 rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-transform hover:-translate-y-0.5"
        style={{ background: "#fff", color: "#dc2626" }}
      >
        {updated ? "↺ Reset to current" : "Quarterly Content Update"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Nav({
  content,
  config,
  stickyTop,
}: {
  content: SubsiteContent;
  config: ResellerConfig;
  stickyTop: string;
}) {
  return (
    <header
      className="sticky z-40 backdrop-blur"
      style={{
        top: stickyTop,
        background: "color-mix(in oklab, var(--vsn-surface) 82%, transparent)",
        borderBottom: "1px solid color-mix(in oklab, var(--vsn-ink) 8%, transparent)",
      }}
    >
      <Container className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          {config.brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.brand.logoUrl} alt={content.resellerName} className="h-7 w-auto" />
          ) : (
            <span className="text-base font-semibold">{content.resellerName}</span>
          )}
          <span style={{ color: "var(--vsn-ink-muted)" }}>·</span>
          <span
            className="vsn-display text-base font-extrabold tracking-tight"
            style={{ color: "var(--vsn-primary)" }}
          >
            {content.vendorName}
          </span>
          <span
            className="hidden text-sm md:inline"
            style={{ color: "var(--vsn-ink-muted)" }}
          >
            {content.productName}
          </span>
        </div>
        <div className="hidden items-center gap-6 sm:flex">
          <a href="#solution" className="text-sm" style={{ color: "var(--vsn-ink-muted)" }}>
            Solution
          </a>
          <a href="#why-us" className="text-sm" style={{ color: "var(--vsn-ink-muted)" }}>
            Why us
          </a>
          <a href="#proof" className="text-sm" style={{ color: "var(--vsn-ink-muted)" }}>
            Proof
          </a>
          <Button cta={content.hero.primaryCta} className="!px-4 !py-2" />
        </div>
      </Container>
    </header>
  );
}

function Hero({
  content,
  prev,
  premium,
  updated,
}: {
  content: SubsiteContent;
  prev: SubsiteContent;
  premium: boolean;
  updated: boolean;
}) {
  const { hero, proof } = content;
  const delay = (i: number): CSSProperties => ({ animationDelay: `${i * 90}ms` });
  return (
    <div className="vsn-atmosphere">
      <Container className="grid gap-12 py-20 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          {/* Partner lockup — static. */}
          <div className="vsn-reveal flex flex-wrap items-center gap-3" style={delay(0)}>
            <span
              className="vsn-display text-2xl font-extrabold tracking-tight"
              style={{ color: "var(--vsn-primary)" }}
            >
              {content.vendorName}
            </span>
            <Badge>Authorized Partner · {content.resellerName}</Badge>
          </div>
          <h1
            className="vsn-reveal mt-5 font-semibold"
            style={{ ...delay(1), fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
          >
            <span style={tHL(changed(updated, hero.headline, prev.hero.headline))}>
              {hero.headline}
            </span>
          </h1>
          <p
            className="vsn-reveal mt-5 max-w-xl text-lg leading-relaxed"
            style={{ ...delay(2), color: "var(--vsn-ink-muted)" }}
          >
            <span style={tHL(changed(updated, hero.subheadline, prev.hero.subheadline))}>
              {hero.subheadline}
            </span>
          </p>
          <div className="vsn-reveal mt-8 flex flex-wrap items-center gap-3" style={delay(3)}>
            <Button cta={hero.primaryCta} variant="primary" />
            <Button cta={hero.secondaryCta} variant="secondary" />
            {premium && hero.aiCta ? <Button cta={hero.aiCta} variant="ghost" /> : null}
          </div>
          {/* Program stats — centrally controlled. */}
          <div
            className="vsn-reveal mt-9 flex flex-wrap items-center gap-x-7 gap-y-3"
            style={delay(4)}
          >
            {proof.stats.map((s, i) => (
              <div
                key={s.label}
                className="min-w-[5rem] px-1"
                style={bHL(changed(updated, s, prev.proof.stats[i]))}
              >
                <div
                  className="vsn-display text-lg font-bold leading-none"
                  style={{ color: "var(--vsn-primary)" }}
                >
                  {s.value}
                </div>
                <div
                  className="mt-1 text-[11px] uppercase tracking-wide"
                  style={{ color: "var(--vsn-ink-muted)" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="vsn-reveal" style={delay(3)}>
          {content.featuredVideo ? (
            <VideoShowcase
              video={content.featuredVideo}
              caption={`▶ ${content.vendorTagline ?? "Watch a real sample episode."}`}
            />
          ) : (
            <Card>
              <div className="flex flex-wrap gap-2">
                {proof.badges.slice(0, 3).map((b) => (
                  <Badge key={b}>{b}</Badge>
                ))}
              </div>
            </Card>
          )}
        </div>
      </Container>
    </div>
  );
}

function PainMap({
  content,
  prev,
  updated,
}: {
  content: SubsiteContent;
  prev: SubsiteContent;
  updated: boolean;
}) {
  return (
    <Section id="solution" alt>
      <Container>
        <SectionHeading
          eyebrow="What this solves"
          title="The problems behind the budget line"
          lead="Not a feature list — a map of what hurts and how this fixes it."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {content.painMap.map((p, i) => (
            <Card key={p.problem} style={bHL(changed(updated, p, prev.painMap[i]))}>
              <h3 className="text-lg font-semibold">{p.problem}</h3>
              <p className="mt-2 text-sm" style={{ color: "var(--vsn-ink-muted)" }}>
                {p.impact}
              </p>
              <div className="vsn-rule my-4" />
              <p className="flex gap-2 text-sm leading-relaxed">
                <span aria-hidden style={{ color: "var(--vsn-accent)" }}>
                  →
                </span>
                {p.solution}
              </p>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function VideoGallery({ content }: { content: SubsiteContent }) {
  const videos = content.videoGallery ?? [];
  if (!videos.length) return null;
  return (
    <Section id="watch">
      <Container>
        <SectionHeading
          eyebrow="See it in action"
          title={`Why employees actually watch ${content.vendorName}`}
          lead={
            content.vendorTagline ??
            "Short, story-driven episodes that hold attention and change behavior."
          }
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <VideoShowcase key={v.id} video={v} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function Capabilities({
  content,
  prev,
  updated,
}: {
  content: SubsiteContent;
  prev: SubsiteContent;
  updated: boolean;
}) {
  return (
    <Section alt>
      <Container>
        <SectionHeading
          eyebrow="Capabilities, as outcomes"
          title="What changes the day you turn it on"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {content.capabilities.map((cap, i) => (
            <div
              key={cap.title}
              className="p-7"
              style={{
                background: "var(--vsn-surface)",
                borderRadius: "var(--vsn-radius)",
                border: "1px solid color-mix(in oklab, var(--vsn-ink) 8%, transparent)",
                ...bHL(changed(updated, cap, prev.capabilities[i])),
              }}
            >
              <div className="text-xl font-semibold">{cap.title}</div>
              {cap.outcome ? (
                <p className="mt-2 text-base" style={{ color: "var(--vsn-ink-muted)" }}>
                  {cap.outcome}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function WhyBuyFromUs({ content }: { content: SubsiteContent }) {
  return (
    <Section id="why-us">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <SectionHeading
          eyebrow={`Why ${content.resellerName}`}
          title="The vendor builds it. We make it yours."
          lead={content.whyBuyFromUs.intro}
        />
        <ul className="grid gap-3 sm:grid-cols-2">
          {content.whyBuyFromUs.services.map((s) => (
            <li
              key={s}
              className="flex items-start gap-3 p-4 text-sm leading-relaxed"
              style={{
                background: "var(--vsn-surface)",
                borderRadius: "var(--vsn-radius)",
                border: "1px solid color-mix(in oklab, var(--vsn-ink) 8%, transparent)",
              }}
            >
              <span
                aria-hidden
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-xs"
                style={{
                  background: "color-mix(in oklab, var(--vsn-primary) 14%, transparent)",
                  color: "var(--vsn-primary)",
                  borderRadius: "999px",
                }}
              >
                ✓
              </span>
              {s}
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}

function Proof({ content }: { content: SubsiteContent }) {
  const t = content.proof.testimonials[0];
  return (
    <Section id="proof" alt>
      <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
        {t ? (
          <figure>
            <blockquote
              className="vsn-display text-2xl leading-snug sm:text-3xl"
              style={{ color: "var(--vsn-ink)" }}
            >
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-5 text-sm" style={{ color: "var(--vsn-ink-muted)" }}>
              {t.author}
              {t.role ? ` — ${t.role}` : ""}
            </figcaption>
          </figure>
        ) : null}
        <div className="flex flex-wrap gap-2.5">
          {content.proof.badges.map((b) => (
            <Badge key={b}>{b}</Badge>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function Resources({
  content,
  prev,
  updated,
}: {
  content: SubsiteContent;
  prev: SubsiteContent;
  updated: boolean;
}) {
  return (
    <Section id="resources">
      <Container>
        <SectionHeading
          eyebrow="Latest from the library"
          title={`New from ${content.vendorName}`}
          lead="Fresh episodes and practical guidance, published throughout the year."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.contentFeed.map((item, i) => (
            <a
              key={item.title}
              href={item.href ?? "#"}
              className="group flex flex-col p-5 transition-transform hover:-translate-y-1"
              style={{
                background: "var(--vsn-surface)",
                borderRadius: "var(--vsn-radius)",
                border: "1px solid color-mix(in oklab, var(--vsn-ink) 8%, transparent)",
                ...bHL(changed(updated, item, prev.contentFeed[i])),
              }}
            >
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
            </a>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function FinalCta({ content }: { content: SubsiteContent }) {
  return (
    <Section id="contact">
      <Container>
        <div
          className="vsn-atmosphere flex flex-col items-center gap-6 px-6 py-16 text-center"
          style={{
            borderRadius: "calc(var(--vsn-radius) + 8px)",
            border: "1px solid color-mix(in oklab, var(--vsn-ink) 10%, transparent)",
          }}
        >
          <h2
            className="vsn-display max-w-2xl font-semibold"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            {content.finalCta.headline}
          </h2>
          <Button cta={content.finalCta.button} variant="primary" className="!px-8 !py-4 !text-base" />
        </div>
      </Container>
    </Section>
  );
}

function Footer({
  content,
  config,
}: {
  content: SubsiteContent;
  config: ResellerConfig;
}) {
  return (
    <footer
      className="mt-auto py-12"
      style={{ borderTop: "1px solid color-mix(in oklab, var(--vsn-ink) 8%, transparent)" }}
    >
      <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-semibold">{content.resellerName}</div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm" style={{ color: "var(--vsn-ink-muted)" }}>
          {config.contact.phone ? <span>{config.contact.phone}</span> : null}
          {config.contact.email ? <span>{config.contact.email}</span> : null}
        </div>
      </Container>
    </footer>
  );
}
