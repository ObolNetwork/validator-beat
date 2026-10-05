import { useState } from "react";
import { Box, Text } from "@obolnetwork/obol-ui";
import type { CSS } from "@stitches/react";
import { VbButton } from "@components/ui/VbButton";
import { AGENT_FILES, ASK_AGENT_ID } from "@lib/agents/prompts";
import { copyText } from "@lib/share/clipboard";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type AskAnAgentProps = {
  /** The prompt, rendered into the static HTML so agents reading the DOM see it too. */
  prompt: string;
  title?: string;
  lede?: string;
  headingAs?: "h2" | "h3";
  css?: CSS;
};

/** A visible, copyable prompt for the visitor's own AI assistant, plus links to the agent docs. */
export function AskAnAgent({
  prompt,
  title = "Ask your AI about your setup",
  lede = "Paste this into ChatGPT, Claude, or any assistant that can read a URL. Fill in the brackets first.",
  headingAs = "h2",
  css,
}: AskAnAgentProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!(await copyText(prompt))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      as="section"
      id={ASK_AGENT_ID}
      aria-labelledby={`${ASK_AGENT_ID}-title`}
      css={{
        backgroundColor: "$bg03",
        border: "1px solid $bg05",
        borderRadius: 14,
        padding: "20px 22px",
        textAlign: "left",
        minWidth: 0,
        "@media (max-width: 760px)": { padding: 16 },
        ...css,
      }}
    >
      <Text
        as={headingAs}
        id={`${ASK_AGENT_ID}-title`}
        css={{ fontSize: "$4", fontWeight: "$bold", color: "$body", margin: 0 }}
      >
        {title}
      </Text>
      <Text as="p" css={{ fontSize: "$2", lineHeight: 1.55, color: "$textMiddle", margin: "6px 0 14px" }}>
        {lede}
      </Text>
      <Box
        as="pre"
        css={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
          fontSize: 13,
          lineHeight: 1.6,
          color: "$body",
          backgroundColor: "$bg01",
          border: "1px solid $bg05",
          borderRadius: 10,
          padding: 14,
          margin: 0,
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          maxHeight: "16rem",
          overflowY: "auto",
        }}
      >
        {prompt}
      </Box>
      <Box css={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 14 }}>
        <VbButton onClick={copy} aria-live="polite">
          {copied ? "Prompt copied ✓" : "Copy prompt"}
        </VbButton>
        <Text as="span" css={{ fontSize: "$2", color: "$textMiddle" }}>
          For agents:{" "}
          {AGENT_FILES.map((f, i) => (
            <span key={f.path}>
              {i > 0 && " · "}
              <Box
                as="a"
                href={`${BASE_PATH}${f.path}`}
                css={{ color: "var(--theme-brand)", textDecoration: "underline" }}
              >
                {f.path.slice(1)}
              </Box>
            </span>
          ))}
        </Text>
      </Box>
    </Box>
  );
}
