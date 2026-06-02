import { Box, Link, Text } from "@obolnetwork/obol-ui";

export function Footer() {
  return (
    <Box
      as="footer"
      css={{
        px: "$xl",
        py: "$lg",
        borderTop: "1px solid $bg05",
        backgroundColor: "$bg01",
      }}
    >
      <Text variant="body" css={{ color: "$muted", fontSize: "$2" }}>
        Validator Beat — transparency for Ethereum node operators.{" "}
        <Link
          href="https://github.com/obolnetwork"
          target="_blank"
          rel="noopener noreferrer"
          css={{ color: "$obolGreen" }}
        >
          Contribute
        </Link>
      </Text>
    </Box>
  );
}
