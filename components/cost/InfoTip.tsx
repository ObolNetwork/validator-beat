import { Box } from "@obolnetwork/obol-ui";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/**
 * A small "i" button that reveals help text. Opens on hover, on keyboard
 * focus and on tap (so it works on touch), closes on Escape or a tap
 * elsewhere. While open, the text is linked to the button with
 * aria-describedby; aria-expanded tells screen-reader users it's there.
 */
export function InfoTip({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const id = useId();
  const root = useRef<HTMLSpanElement | null>(null);
  const [pos, setPos] = useState({ left: -8, width: 300 });

  // Place the bubble from the button's position, measured before it opens (an
  // open bubble can widen the layout viewport on mobile), keeping a 16px
  // gutter on both sides.
  const place = () => {
    const el = root.current;
    if (!el) return;
    const vw = document.documentElement.clientWidth;
    const width = Math.min(300, vw - 32);
    const btnLeft = el.getBoundingClientRect().left;
    const start = Math.min(Math.max(btnLeft - 8, 16), vw - 16 - width);
    setPos({ left: start - btnLeft, width });
  };
  const show = () => {
    place();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setPinned(false);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) {
        setOpen(false);
        setPinned(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <Box
      as="span"
      ref={root}
      css={{ position: "relative", display: "inline-flex", verticalAlign: "middle", marginLeft: 6 }}
      onMouseEnter={show}
      onMouseLeave={() => !pinned && setOpen(false)}
    >
      <Box
        as="button"
        type="button"
        aria-label={`About ${label}`}
        aria-expanded={open}
        aria-describedby={open ? id : undefined}
        onClick={() => {
          // A click pins it open (for touch); a second click closes it.
          const next = !pinned;
          setPinned(next);
          if (next) show();
          else setOpen(false);
        }}
        onFocus={show}
        onBlur={() => !pinned && setOpen(false)}
        css={{
          all: "unset",
          cursor: "pointer",
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: "1.5px solid $textMiddle",
          color: "$textMiddle",
          fontSize: 11,
          fontWeight: "$bold",
          fontStyle: "italic",
          fontFamily: "Georgia, serif",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
          "&:hover": { color: "$body", borderColor: "$body" },
          "&:focus-visible": { outline: "2px solid var(--theme-brand)", outlineOffset: 2 },
          // Bigger hit area without a bigger icon.
          "&::after": { content: '""', position: "absolute", inset: -8 },
        }}
      >
        i
      </Box>
      {open && (
        <Box
          as="span"
          id={id}
          role="tooltip"
          style={{ left: pos.left, width: pos.width }}
          css={{
            position: "absolute",
            top: "calc(100% + 8px)",
            zIndex: 40,
            boxSizing: "border-box",
            padding: "10px 12px",
            borderRadius: "$3",
            backgroundColor: "$bg02",
            border: "1px solid $bg05",
            boxShadow: "0 8px 24px rgba(0,0,0,.14)",
            color: "$body",
            fontSize: "$1",
            fontWeight: "$regular",
            fontStyle: "normal",
            lineHeight: 1.5,
            textTransform: "none",
            letterSpacing: 0,
            whiteSpace: "normal",
            textAlign: "left",
            "& a": { color: "var(--theme-brand)", textDecoration: "underline" },
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
}
