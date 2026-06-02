import { Box, Text } from "@obolnetwork/obol-ui";
import { RUBRIC_VERSION } from "@lib/rubric";
import type { GetStaticProps } from "next";

export default function MethodologyPage() {
  return (
    <Box css={{ display: "flex", flexDirection: "column", gap: "$lg" }}>
      <Text variant="h3" css={{ color: "$body" }}>
        Methodology
      </Text>
      <Text variant="body" css={{ color: "$muted" }}>
        Public rubric documentation for Validator Beat v{RUBRIC_VERSION}: six
        slices, Stage 0–2, and Non-Disclosure handling. Detailed thresholds will
        be published here from the v1.2 spec.
      </Text>
    </Box>
  );
}

export const getStaticProps: GetStaticProps = () => ({
  props: {
    title: "Methodology",
    description: "Validator Beat scoring methodology and stages.",
  },
});
