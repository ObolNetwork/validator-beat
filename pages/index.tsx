import { AssessmentApp } from "@components/assessment/AssessmentApp";
import type { GetStaticProps } from "next";

export default function HomePage() {
  return <AssessmentApp />;
}

export const getStaticProps: GetStaticProps = () => ({
  props: {
    title: "Self-assessment",
    description:
      "Six questions about your validator setup. Score your resilience in about a minute — nothing is submitted or stored.",
  },
});
