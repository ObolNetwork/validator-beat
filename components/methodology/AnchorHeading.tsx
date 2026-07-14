import { useRef, useState, type ReactNode } from "react";

type AnchorHeadingProps = {
  /** Stable slug — becomes the element id and the #fragment. Treat as a public URL. */
  id: string;
  as?: "h2" | "h3";
  children: ReactNode;
};

/**
 * Heading with a hover-revealed "#" that navigates to the fragment and copies
 * the full section URL to the clipboard, with brief inline feedback.
 */
export function AnchorHeading({
  id,
  as: Tag = "h2",
  children,
}: AnchorHeadingProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const copy = () => {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    void navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <Tag id={id} className="vb-anchor">
      {children}
      <a
        href={`#${id}`}
        className="vb-anchor__link"
        aria-label="Copy link to this section"
        onClick={copy}
      >
        #
      </a>
      {copied && (
        <span className="vb-anchor__copied" role="status">
          Link copied
        </span>
      )}
    </Tag>
  );
}
