import { Box } from "@obolnetwork/obol-ui";
import NextLink from "next/link";
import { useRouter } from "next/router";
import type { CSS } from "@stitches/react";
import {
  BrandAccent,
  BrandLink,
  TopNavLink,
  TopSpacer,
} from "@components/assessment/stitches";
import { ThemeToggle } from "@components/assessment/ThemeToggle";
import { IconArrowRight } from "@components/landing/icons";
import { ASSESS_PATH, METHODOLOGY_PATH, VALOS_URL } from "@constants/index";

const bar: CSS = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  borderBottom: "1px solid $bg05",
  backgroundColor: "$bg01",
  backdropFilter: "blur(10px)",
};
const navLink: CSS = {
  fontSize: "$2",
  fontWeight: "$medium",
  color: "$textMiddle",
  textDecoration: "none",
  "&:hover": { color: "$body" },
};
const links: CSS = {
  display: "flex",
  alignItems: "center",
  gap: 22,
  "@media (max-width: 720px)": { display: "none" },
};
const cta: CSS = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontSize: "$3",
  fontWeight: "$semibold",
  textDecoration: "none",
  whiteSpace: "nowrap",
  borderRadius: "$3",
  padding: "12px 22px",
  backgroundColor: "var(--theme-brand)",
  color: "var(--theme-text-on-brand)",
  "&:hover": { backgroundColor: "var(--theme-brand-hover)" },
};

/** Validator Beat pizza mark. Reads the --vb-* tokens so it follows the theme
    (muted on cream, bright on dark) like the in-app pizza. */
function Mark() {
  return (
    <Box
      as="svg"
      viewBox="0 0 24 24"
      aria-hidden="true"
      css={{ width: 22, height: 22, flexShrink: 0 }}
    >
      <g transform="translate(12 12)">
        <path d="M0 0 L0 -11 A11 11 0 0 1 9.5 -5.5 Z" fill="var(--vb-green)" />
        <path d="M0 0 L9.5 -5.5 A11 11 0 0 1 9.5 5.5 Z" fill="var(--vb-yellow)" />
        <path d="M0 0 L9.5 5.5 A11 11 0 0 1 0 11 Z" fill="var(--vb-green)" />
        <path d="M0 0 L0 11 A11 11 0 0 1 -9.5 5.5 Z" fill="var(--vb-red)" />
        <path d="M0 0 L-9.5 5.5 A11 11 0 0 1 -9.5 -5.5 Z" fill="var(--vb-green)" />
        <path d="M0 0 L-9.5 -5.5 A11 11 0 0 1 0 -11 Z" fill="var(--vb-yellow)" />
        <circle
          r="4"
          fill="var(--theme-pizza-plate)"
          stroke="var(--theme-pizza-empty-stroke)"
          strokeWidth="1"
        />
      </g>
    </Box>
  );
}

type SiteHeaderProps = {
  /** Max width of the inner content — match the page's main column (landing 1140, assessment 1440). */
  contentWidth?: number;
};

/** Shared site header — the landing nav, reused across the landing, assessment,
    and methodology. The "Assess your validator" CTA hides on /assess (you're
    already there); "How it works" links to the landing's #how section (via
    next/link so it carries the basePath). */
export function SiteHeader({ contentWidth = 1140 }: SiteHeaderProps) {
  const router = useRouter();
  const onAssess = router.pathname === "/assess";

  return (
    <Box as="nav" aria-label="Main" css={bar}>
      <Box
        as="a"
        href="#main-content"
        css={{
          position: "absolute",
          left: -9999,
          zIndex: 10,
          padding: "8px 14px",
          backgroundColor: "$bg01",
          color: "$body",
          fontSize: "$2",
          fontWeight: "$semibold",
          "&:focus-visible": { left: 8, top: 8 },
        }}
      >
        Skip to content
      </Box>
      <Box
        css={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          maxWidth: contentWidth,
          margin: "0 auto",
          padding: "14px 28px",
        }}
      >
        <BrandLink href="/" css={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Mark /> Validator <BrandAccent>Beat</BrandAccent>
        </BrandLink>
        <TopSpacer />
        <Box css={links}>
          <Box as={NextLink} href="/#how" css={navLink}>
            How it works
          </Box>
          <TopNavLink href={METHODOLOGY_PATH}>Methodology</TopNavLink>
          <Box
            as="a"
            href={VALOS_URL}
            target="_blank"
            rel="noopener noreferrer"
            css={navLink}
          >
            valOS
          </Box>
        </Box>
        <ThemeToggle />
        {!onAssess && (
          <Box as={NextLink} href={ASSESS_PATH} css={cta}>
            Assess your validator <IconArrowRight size={16} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
