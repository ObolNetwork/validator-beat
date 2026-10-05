import { Fragment } from "react";

/** Render a copy string's `**bold**` spans as <strong> (see lib/methodology/content.ts). */
export function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
        i % 2 ? <strong key={i}>{part}</strong> : <Fragment key={i}>{part}</Fragment>,
      )}
    </>
  );
}
