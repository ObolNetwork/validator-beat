import { CostOfFailure } from "@components/cost/CostOfFailure";
import { SITE_URL } from "@constants/index";
import type { GetStaticProps } from "next";

export default function CostOfFailurePage() {
  return <CostOfFailure />;
}

export const getStaticProps: GetStaticProps = () => ({
  props: {
    title: "The cost of failure",
    ogImage: `${SITE_URL.replace(/\/$/, "")}/og/cost-of-failure.png`,
    description:
      "What one key compromise, slashing or outage costs a stake at Stage 0 vs Stage 1, from the consensus spec and today's queues, and when the Stage 1 premium pays for itself.",
  },
});
