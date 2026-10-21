import { CostOfFailure } from "@components/cost/CostOfFailure";
import { GITHUB_URL, SITE_NAME, SITE_URL } from "@constants/index";
import type { GetStaticProps } from "next";
import Head from "next/head";

const BASE = SITE_URL.replace(/\/$/, "");

/** Structured data so crawlers and agents know what this page is and where its full description lives. */
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: `${SITE_NAME}: the cost of failure`,
  description:
    "Compares the same Ethereum staking operators running a stake separately (Stage 0) with running it together as a multi-operator distributed validator (Stage 1): expected losses, the extra cost, the break-even incident rate, from the consensus spec and current queues.",
  url: `${BASE}/cost-of-failure/`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any (runs in the browser)",
  isAccessibleForFree: true,
  isPartOf: { "@type": "WebSite", name: SITE_NAME, url: `${BASE}/` },
  publisher: { "@type": "Organization", name: "Obol", url: "https://obol.org" },
  sameAs: [GITHUB_URL],
  subjectOf: { "@type": "CreativeWork", name: "llms-full.txt", url: `${BASE}/llms-full.txt` },
};

export default function CostOfFailurePage() {
  return (
    <>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      </Head>
      <CostOfFailure />
    </>
  );
}

export const getStaticProps: GetStaticProps = () => ({
  props: {
    title: "Is it worth running your validators together?",
    ogImage: `${SITE_URL.replace(/\/$/, "")}/og/cost-of-failure.png`,
    description:
      "Solo operators (Stage 0) vs the same operators running a multi-operator distributed validator (Stage 1): what a key compromise or outage costs each, the extra cost, and when it pays for itself.",
  },
});
