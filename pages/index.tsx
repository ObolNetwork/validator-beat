import { Box, Button, Link, Text } from "@obolnetwork/obol-ui";
import { SITE_DESCRIPTION } from "@constants/index";
import type { GetStaticProps } from "next";

const surveyUrl = process.env.NEXT_PUBLIC_SURVEY_URL;

export default function HomePage() {
  return (
    <Box css={{ display: "flex", flexDirection: "column", gap: "$xl" }}>
      <Box css={{ display: "flex", flexDirection: "column", gap: "$md" }}>
        <Text variant="h2" css={{ color: "$body" }}>
          Validator Beat
        </Text>
        <Text variant="body" css={{ color: "$muted", maxWidth: "640px" }}>
          {SITE_DESCRIPTION}
        </Text>
      </Box>
      <Box css={{ display: "flex", gap: "$md", flexWrap: "wrap" }}>
        <Link href="/operators/">
          <Button>View operators</Button>
        </Link>
        {surveyUrl ? (
          <Link href={surveyUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary">Take the survey</Button>
          </Link>
        ) : null}
      </Box>
      <Text variant="body" css={{ color: "$muted", fontSize: "$2" }}>
        Framework v1.2 — six slices, Stage 0–2. Full manifesto copy ships in a
        follow-up PR.
      </Text>
    </Box>
  );
}

export const getStaticProps: GetStaticProps = () => ({
  props: {
    title: "Manifesto",
    description: SITE_DESCRIPTION,
  },
});
