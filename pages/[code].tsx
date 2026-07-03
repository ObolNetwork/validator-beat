import { AssessmentApp } from "@components/assessment/AssessmentApp";
import { SITE_URL } from "@constants/index";
import { computeStage, decodeShareCode } from "@lib/rubric";
import { shareOgMeta } from "@lib/share/og-meta";
import { allShareCodes } from "@lib/theme/share-codes";
import type { GetStaticPaths, GetStaticProps } from "next";

type SharePageProps = {
  initialShareCode: string;
  title: string;
  description: string;
  ogImage: string;
  canonicalUrl: string;
};

export default function SharePage({ initialShareCode }: SharePageProps) {
  return <AssessmentApp initialShareCode={initialShareCode} />;
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: allShareCodes().map((code) => ({ params: { code } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<SharePageProps> = ({ params }) => {
  const code = String(params?.code ?? "").toUpperCase();
  const answers = decodeShareCode(code);
  if (!answers || computeStage(answers) == null) {
    return { notFound: true };
  }

  const meta = shareOgMeta(answers);
  const base = SITE_URL.replace(/\/$/, "");

  return {
    props: {
      initialShareCode: code,
      title: meta.title,
      description: meta.description,
      ogImage: `${base}/og/${code}.png`,
      // trailingSlash: true — the exported page lives at /<code>/
      canonicalUrl: `${base}/${code}/`,
    },
  };
};
