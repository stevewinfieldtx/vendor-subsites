/**
 * "Showroom" archetype — refined, spacious, product-forward. One of six layout
 * languages. Renders a Premium subsite from SubsiteContent + the resolved theme.
 * Server component; interactive pieces (selectors, advisor) are client islands.
 */
import type { CSSProperties } from "react";
import { themeStyle } from "@/lib/theme";
import type { ResellerConfig, VendorMapping } from "@/lib/tenant";
import type { SubsiteContent } from "@/lib/content";
import {
  Badge,
  Button,
  Card,
  Container,
  Eyebrow,
  Section,
  SectionHeading,
} from "@/components/ui";
import { IndustrySelector, RoleSelector } from "./Selectors";
import { Advisor } from "@/components/advisor/Advisor";

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

  return (
    <div className="vsn-root flex min-h-full flex-col" style={rootStyle}>
      <Nav content={content} config={config} />

      <Hero content={content} premium={premium} />

      <PainMap content={content} />

      <Capabilities content={content} />

      {premium && content.roles?.length ? (
        <Section id="roles" alt>
          <Container>
            <SectionHeading
              eyebrow="Built for your seat"
              title="See it from where you sit"
              lead="The same platform reads differently depending on what you own. Pick your role."
            />
            <div className="mt-10">
              <RoleSelector roles={content.roles} />
            </div>
          </Container>
        </Section>
      ) : null}

      {premium && content.industries?.length ? (
        <Section id="industries">
          <Container>
            <SectionHeading
              eyebrow="Your world"
              title="Tuned to your industry"
              lead="Compliance, threats, and constraints differ by sector. Choose yours."
            />
            <div className="mt-10">
              <IndustrySelector industries={content.industries} />
            </div>
          </Container>
        </Section>
      ) : null}

      <WhyBuyFromUs content={content} />

      <Proof content={content} />

      <ContentFeed content={content} />

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

function Nav({
  content,
  config,
}: {
  content: SubsiteContent;
  config: ResellerConfig;
}) {
  return (
    <header
      className="sticky top-0 z-40 backdrop-blur"
      style={{
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
          <span className="text-sm" style={{ color: "var(--vsn-ink-muted)" }}>
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
  premium,
}: {
  content: SubsiteContent;
  premium: boolean;
}) {
  const { hero, proof } = content;
  const delay = (i: number): CSSProperties => ({ animationDelay: `${i * 90}ms` });
  return (
    <div className="vsn-atmosphere">
      <Container className="grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
        <div>
          <div className="vsn-reveal" style={delay(0)}>
            <Eyebrow>{hero.eyebrow}</Eyebrow>
          </div>
          <h1
            className="vsn-reveal mt-5 font-semibold"
            style={{ ...delay(1), fontSize: "clamp(2.5rem, 5.5vw, 4.25rem)" }}
          >
            {hero.headline}
          </h1>
          <p
            className="vsn-reveal mt-6 max-w-xl text-lg leading-relaxed"
            style={{ ...delay(2), color: "var(--vsn-ink-muted)" }}
          >
            {hero.subheadline}
          </p>
          <div className="vsn-reveal mt-9 flex flex-wrap items-center gap-3" style={delay(3)}>
            <Button cta={hero.primaryCta} variant="primary" />
            <Button cta={hero.secondaryCta} variant="secondary" />
            {premium && hero.aiCta ? <Button cta={hero.aiCta} variant="ghost" /> : null}
          </div>
        </div>

        {/* Proof rail — puts evidence above the fold (the benchmark's #1 gap). */}
        <div className="vsn-reveal" style={delay(4)}>
          <Card style={{ background: "color-mix(in oklab, var(--vsn-surface) 88%, transparent)" }}>
            <div className="grid grid-cols-3 gap-4">
              {proof.stats.map((s) => (
                <div key={s.label}>
                  <div
                    className="vsn-display text-3xl font-semibold"
                    style={{ color: "var(--vsn-primary)" }}
                  >
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs" style={{ color: "var(--vsn-ink-muted)" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="vsn-rule my-5" />
            <div className="flex flex-wrap gap-2">
              {proof.badges.slice(0, 3).map((b) => (
                <Badge key={b}>{b}</Badge>
              ))}
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
}

function PainMap({ content }: { content: SubsiteContent }) {
  return (
    <Section id="solution" alt>
      <Container>
        <SectionHeading
          eyebrow="What this solves"
          title="The problems behind the budget line"
          lead="Not a feature list — a map of what hurts and how this fixes it."
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {content.painMap.map((p) => (
            <Card key={p.problem}>
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

function Capabilities({ content }: { content: SubsiteContent }) {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Capabilities, as outcomes"
          title="What changes the day you turn it on"
        />
        <div className="mt-10 grid gap-px overflow-hidden sm:grid-cols-2"
          style={{
            background: "color-mix(in oklab, var(--vsn-ink) 8%, transparent)",
            borderRadius: "var(--vsn-radius)",
          }}
        >
          {content.capabilities.map((cap) => (
            <div key={cap.title} className="p-7" style={{ background: "var(--vsn-surface)" }}>
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
    <Section id="why-us" alt>
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
    <Section id="proof">
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

function ContentFeed({ content }: { content: SubsiteContent }) {
  return (
    <Section alt>
      <Container>
        <SectionHeading
          eyebrow="Always current"
          title="Updated from the source"
          lead="New releases and guidance flow in automatically — you never maintain this page."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {content.contentFeed.map((item) => (
            <a
              key={item.title}
              href={item.href ?? "#"}
              className="group flex flex-col p-5 transition-transform hover:-translate-y-1"
              style={{
                background: "var(--vsn-surface)",
                borderRadius: "var(--vsn-radius)",
                border: "1px solid color-mix(in oklab, var(--vsn-ink) 8%, transparent)",
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
