import { Box, Link, Text } from "@obolnetwork/obol-ui";

export default function NotFoundPage() {
  return (
    <Box css={{ display: "flex", flexDirection: "column", gap: "$md" }}>
      <Text variant="h3">Page not found</Text>
      <Link href="/">Back to home</Link>
    </Box>
  );
}
