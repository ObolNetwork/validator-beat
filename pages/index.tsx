import { Landing } from "@components/landing/Landing";
import { SITE_URL } from "@constants/index";
import type { GetStaticProps } from "next";
import Head from "next/head";

export default function HomePage() {
  const base = SITE_URL.replace(/\/$/, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Validator Beat",
    url: `${base}/`,
    description:
      "A free self-assessment that scores Ethereum validator setups Stage 0, 1, or 2 across six single points of failure: key custody, client diversity, infrastructure, OS, CPU architecture, and geography.",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: {
      "@type": "Organization",
      name: "Obol",
      url: "https://obol.org",
    },
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <Landing />
    </>
  );
}

export const getStaticProps: GetStaticProps = () => {
  const base = SITE_URL.replace(/\/$/, "");
  return {
    props: {
      title: "The standard for staking security",
      description:
        "Staking earns ~2% APR — slashing can take everything. Six questions score any Ethereum validator Stage 0, 1, or 2. Don't stake below Stage 1.",
      ogImage: `${base}/og/landing.png`,
      canonicalUrl: `${base}/`,
    },
  };
};
