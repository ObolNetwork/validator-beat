import Link from "next/link";
import {
  BrandAccent,
  BrandLink,
  TagPill,
  TopBar,
} from "@components/assessment/stitches";
import { SLICES } from "@lib/rubric";
import type { GetStaticProps } from "next";

export default function MethodologyPage() {
  return (
    <div className="vb-methodology">
      <TopBar as="header" className="vb-methodology__top">
        <Link href="/" passHref legacyBehavior>
          <BrandLink>
            Validator <BrandAccent>Beat</BrandAccent>
          </BrandLink>
        </Link>
        <TagPill>v0.1 · methodology</TagPill>
      </TopBar>

      <main className="vb-methodology__main">
        <h1>Methodology</h1>
        <p className="vb-methodology__lede">
          Validator Beat v0.1 is a <strong>self-assessment</strong> tool. You answer six banded
          questions; each answer maps directly to a slice color (green, yellow, or red). Your
          overall <strong>Stage</strong> rolls up from those six colors. Nothing is sent to a
          server — scoring runs entirely in your browser.
        </p>

        <section>
          <h2>Stages</h2>
          <ul>
            <li>
              <strong>Stage 0 — Getting started:</strong> At least one slice is red (a single
              point of failure remains).
            </li>
            <li>
              <strong>Stage 1 — Safety:</strong> No red slices, but not all green — no single
              party should be able to get you slashed.
            </li>
            <li>
              <strong>Stage 2 — Liveness:</strong> All six slices green — no single failure should
              be able to slash you, stop you, or censor you.
            </li>
          </ul>
        </section>

        <section>
          <h2>The six slices</h2>
          <ol>
            {SLICES.map((s) => (
              <li key={s.id}>
                <strong>{s.label}</strong> — {s.why}
              </li>
            ))}
          </ol>
          <p>
            For infrastructure, OS, CPU, and geography, questions assume each validator runs as a{" "}
            <strong>distributed validator (DVT)</strong> or behind a <strong>multiplexer</strong> —
            duties split across independent nodes so diversity translates into uptime.
          </p>
        </section>

        <section>
          <h2>How answers map to colors</h2>
          <p>
            Each question offers three banded choices (best → worst). Your selection <em>is</em>{" "}
            the slice color — there is no separate backend calculation in v0.1.
          </p>
          <p>
            <strong>Client diversity</strong> uses a simplified banded model; live network client
            share thresholds are deferred to a future operator registry (v1.2 spec).
          </p>
        </section>

        <section>
          <h2>Share codes</h2>
          <p>
            Your six-letter share code (e.g. <code>GYRYGG</code>) encodes green (G), yellow (Y), or
            red (R) per slice in pizza order. It lets you share a result link without storing personal
            data.
          </p>
        </section>

        <section>
          <h2>What&apos;s next</h2>
          <p>
            A future <strong>operator registry</strong> will publish verified operator profiles
            using the fuller Validator Beat v1.2 rubric (YAML data, per-slice minimums for stages).
            v0.1 focuses on helping individual operators understand their own setup first.
          </p>
        </section>

        <p className="vb-methodology__back">
          <Link href="/" className="vbbtn vbbtn--primary">
            Take the assessment →
          </Link>
        </p>
      </main>
    </div>
  );
}

export const getStaticProps: GetStaticProps = () => ({
  props: {
    title: "Methodology",
    description: "How Validator Beat v0.1 scores slices and stages.",
  },
});
