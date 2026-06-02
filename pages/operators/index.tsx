import { Box, Text } from "@obolnetwork/obol-ui";
import type { GetStaticProps } from "next";

export default function OperatorsPage() {
  return (
    <Box css={{ display: "flex", flexDirection: "column", gap: "$lg" }}>
      <Text variant="h3" css={{ color: "$body" }}>
        Operators
      </Text>
      <Text variant="body" css={{ color: "$muted" }}>
        Summary table (sortable, stage, risks, ETH secured) will land here
        using obol-ui TableV3.
      </Text>
    </Box>
  );
}

export const getStaticProps: GetStaticProps = () => ({
  props: {
    title: "Operators",
    description: "Ethereum node operator transparency summary.",
  },
});
