import { Box, Text } from "@obolnetwork/obol-ui";
import * as s from "./styles";

/** "Want more detail?" prompt shown in the Basic view, with a clear button. */
export function AdvancedCTA({ onClick, compact = false }: { onClick: () => void; compact?: boolean }) {
  return (
    <Box
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 18,
        flexWrap: "wrap",
        padding: compact ? "18px 22px" : "24px 28px",
        borderRadius: 14,
        border: "1.5px dashed var(--theme-brand)",
        backgroundColor: "color-mix(in srgb, var(--theme-brand) 6%, transparent)",
      }}
    >
      <Box css={{ maxWidth: 680 }}>
        <Text as="h2" css={{ ...s.h3, fontSize: compact ? 18 : 22 }}>
          Want to see more detail?
        </Text>
        {!compact && (
          <Text css={{ ...s.small, fontSize: "$2", marginTop: 6 }}>
            Advanced shows each incident day by day, the full range of outcomes, the model behind every number, and lets you
            change every assumption: queues, operator size, how the attack plays out.
          </Text>
        )}
      </Box>
      <Box
        as="button"
        type="button"
        onClick={onClick}
        css={{
          all: "unset",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: "$3",
          fontWeight: "$semibold",
          borderRadius: "$3",
          padding: "12px 22px",
          backgroundColor: "var(--theme-brand)",
          color: "var(--theme-text-on-brand)",
          "&:hover": { backgroundColor: "var(--theme-brand-hover)" },
          "&:focus-visible": { outline: "2px solid var(--theme-brand)", outlineOffset: 3 },
        }}
      >
        Switch to Advanced →
      </Box>
    </Box>
  );
}
