import { Landing } from "@components/landing/Landing";
import type { GetStaticProps } from "next";

export default function HomePage() {
  return <Landing />;
}

export const getStaticProps: GetStaticProps = () => ({
  props: {
    title: "The standard for validator resilience",
    description:
      "When you stake, you pick an operator — but you can't see how they run. Validator Beat makes validator resilience visible: six slices, one Stage, one pizza.",
  },
});
