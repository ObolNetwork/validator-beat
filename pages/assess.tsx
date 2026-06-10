import { AssessmentApp } from "@components/assessment/AssessmentApp";
import type { GetStaticProps } from "next";

export default function AssessPage() {
  return <AssessmentApp />;
}

export const getStaticProps: GetStaticProps = () => ({
  props: {
    title: "Self-assessment",
    description:
      "Six questions about your Ethereum validator setup. Score your resilience in about a minute — nothing is submitted or stored.",
  },
});
