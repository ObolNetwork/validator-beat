import { Box, Text } from "@obolnetwork/obol-ui";
import type { CSS } from "@stitches/react";
import { useRef, useState, type ReactNode } from "react";

interface AnchorProps {
  /** Stable slug: the element id and #fragment. Treat as a public URL. */
  id: string;
  as?: "h1" | "h2" | "h3";
  css?: CSS;
  children: ReactNode;
}

/**
 * Heading with a hover-revealed "#" (always visible on touch) that jumps to
 * the fragment and copies a link to it. The link keeps the query string, so
 * it opens on the same assumptions.
 */
export function Anchor({ id, as = "h2", css, children }: AnchorProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const copy = () => {
    const url = `${window.location.origin}${window.location.pathname}${window.location.search}#${id}`;
    void navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <Text
      as={as}
      id={id}
      css={{
        ...css,
        "& .cost-anchor": { opacity: 0.3 },
        "&:hover .cost-anchor, & .cost-anchor:focus-visible": { opacity: 1, color: "var(--theme-cost-link)" },
        "@media (hover: none)": { "& .cost-anchor": { opacity: 0.5 } },
      }}
    >
      {children}
      <Box
        as="a"
        href={`#${id}`}
        className="cost-anchor"
        aria-label="Copy link to this section"
        onClick={copy}
        css={{
          marginLeft: "0.35em",
          color: "$textMiddle",
          textDecoration: "none",
          fontWeight: "$semibold",
          transition: "opacity 120ms ease, color 120ms ease",
          "&:focus-visible": { outline: "2px solid var(--theme-brand)", outlineOffset: 2, borderRadius: 3 },
        }}
      >
        #
      </Box>
      {copied && (
        <Box as="span" role="status" css={{ marginLeft: 10, fontSize: 12, fontWeight: "$medium", color: "var(--theme-cost-link)", letterSpacing: 0 }}>
          Link copied
        </Box>
      )}
    </Text>
  );
}
