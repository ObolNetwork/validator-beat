import Link from "next/link";
import { SiteHeader } from "@components/layout/SiteHeader";
import { SiteFooter } from "@components/layout/SiteFooter";
import { ASSESS_PATH } from "@constants/index";
import { SLICES, STAGE_META } from "@lib/rubric";
import type { GetStaticProps } from "next";

export default function MethodologyPage() {
  return (
    <div className="vb-methodology">
      <SiteHeader />

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
              <strong>
                {STAGE_META[0].name} — {STAGE_META[0].kind}:
              </strong>{" "}
              At least one slice is red (a single point of failure remains).
            </li>
            <li>
              <strong>
                {STAGE_META[1].name} — {STAGE_META[1].kind}:
              </strong>{" "}
              No red slices, but not all green — no single failure should be able to expose you
              to slashing.
            </li>
            <li>
              <strong>
                {STAGE_META[2].name} — {STAGE_META[2].kind}:
              </strong>{" "}
              All six slices green — no single point of failure should be able to slash you or
              take you offline.
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
            For infrastructure, OS, CPU, and geography, diversity only translates into resilience
            when your validator runs <strong>active/active</strong>: several cooperating nodes back
            the same stake, with signing continuing as long as enough of them stay up. The stake
            isn&apos;t partitioned across machines — it&apos;s one aggregate validator whose
            cooperating machines you&apos;ve diversified. Several setups achieve this —
            multi-operator <strong>distributed validators (DVT)</strong> coordinated by Charon, or
            validator clients like <strong>Vouch</strong> paired with multiplexers like{" "}
            <strong>Vero</strong> and remote signers like <strong>Dirk</strong> or{" "}
            <strong>Web3Signer</strong>. The common requirement: no single party holds enough key
            material to sign alone — at least two independent parties involved, backups kept
            separate, so compromising one doesn&apos;t leak the full private key.
          </p>
        </section>

        <section>
          <h2>Further reading</h2>
          <ul>
            <li>
              <a
                href="https://lidofinance.github.io/valos/valos-spec.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                valOS — the Validator Operating Standard
              </a>
              {" "}— the canonical risk-and-mitigation catalog for validator operators. Nearly
              every risk surfaced in this assessment has a corresponding mitigation in valOS.
            </li>
            <li>
              <a
                href="https://clientdiversity.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                clientdiversity.org
              </a>
              {" "}— live network share for each Ethereum consensus and execution client.
            </li>
            <li>
              <a href="https://docs.obol.org/" target="_blank" rel="noopener noreferrer">
                Obol docs
              </a>
              {" "}— distributed validators, Charon, and chain-split safety settings.
            </li>
            <li>
              <a
                href="https://eips.ethereum.org/EIPS/eip-7716"
                target="_blank"
                rel="noopener noreferrer"
              >
                EIP-7716 — Anti-correlation attestation penalties
              </a>
              {" "}— proposal to scale downtime penalties by correlation, so diversified setups
              pay less when many validators miss attestations together.
            </li>
          </ul>
        </section>

        <section>
          <h2>Why correlation matters</h2>
          <p>
            Ethereum&apos;s penalty math is already super-linear in correlation. Slashing penalties
            scale with how many validators are slashed in the same window — an event that takes
            out many validators at once costs each affected validator far more than an isolated
            slashing would.{" "}
            <a
              href="https://eips.ethereum.org/EIPS/eip-7716"
              target="_blank"
              rel="noopener noreferrer"
            >
              EIP-7716
            </a>{" "}
            (&ldquo;Anti-correlation attestation penalties&rdquo;) proposes the same shape for
            <em> outages</em>: more diversified entities get lower penalties, while entities with
            high correlations in their setup face more severe ones. Spreading across the six
            slices here isn&apos;t just defensive — it materially reduces the magnitude of any
            single bad day, today for slashing and (under EIP-7716) tomorrow for downtime.
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
          <Link href={ASSESS_PATH} className="vbbtn vbbtn--primary">
            Take the assessment →
          </Link>
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}

export const getStaticProps: GetStaticProps = () => ({
  props: {
    title: "Methodology",
    description: "How Validator Beat v0.1 scores slices and stages.",
  },
});
