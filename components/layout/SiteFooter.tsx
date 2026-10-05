import { Box, Text } from "@obolnetwork/obol-ui";
import type { CSS } from "@stitches/react";
import { TopNavLink, TopSpacer } from "@components/assessment/stitches";
import {
  ASSESS_PATH,
  GITHUB_URL,
  METHODOLOGY_PATH,
  VALOS_URL,
} from "@constants/index";
import { AGENT_FILES, ASK_AGENT_ID } from "@lib/agents/prompts";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const navLink: CSS = {
  fontSize: "$2",
  fontWeight: "$medium",
  color: "$textMiddle",
  textDecoration: "none",
  "&:hover": { color: "$body" },
};

type SiteFooterProps = {
  /** Max width of the inner content — match the page's main column. */
  contentWidth?: number;
};

/** Shared site footer — reused across the landing, assessment, and methodology. */
export function SiteFooter({ contentWidth = 1140 }: SiteFooterProps) {
  return (
    <Box
      as="footer"
      css={{ borderTop: "1px solid $bg05", backgroundColor: "$bg01", py: "$lg" }}
    >
      <Box
        css={{
          maxWidth: contentWidth,
          margin: "0 auto",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <Text css={{ fontSize: "$2", fontWeight: "$bold", color: "$body" }}>
          Validator{" "}
          <Text as="span" css={{ display: "inline", color: "var(--theme-brand)" }}>
            Beat
          </Text>
        </Text>
        <Text css={{ fontSize: "$2", color: "$textMiddle" }}>
          A simple view into validator operations
        </Text>
        <TopSpacer />
        <TopNavLink href={METHODOLOGY_PATH}>Methodology</TopNavLink>
        <Box
          as="a"
          href={VALOS_URL}
          target="_blank"
          rel="noopener noreferrer"
          css={navLink}
        >
          ValOS
        </Box>
        <Box
          as="a"
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          css={navLink}
        >
          GitHub
        </Box>
        <TopNavLink href={ASSESS_PATH}>Assess</TopNavLink>
      </Box>
      <Box
        as="nav"
        aria-label="For AI agents"
        css={{
          maxWidth: contentWidth,
          margin: "10px auto 0",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          gap: "6px 16px",
          flexWrap: "wrap",
        }}
      >
        <Text css={{ fontSize: "$1", fontWeight: "$semibold", color: "$textMiddle" }}>
          For AI agents
        </Text>
        {AGENT_FILES.map((f) => (
          <Box key={f.path} as="a" href={`${BASE_PATH}${f.path}`} css={{ ...navLink, fontSize: "$1" }}>
            {f.path.slice(1)}
          </Box>
        ))}
        <TopNavLink href={`/#${ASK_AGENT_ID}`} css={{ fontSize: "$1" }}>
          Ask your AI
        </TopNavLink>
      </Box>
    </Box>
  );
}
