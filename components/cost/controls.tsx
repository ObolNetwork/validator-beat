import { Box, Text } from "@obolnetwork/obol-ui";
import type { CSS } from "@stitches/react";
import { useEffect, useId, useState, type ReactNode } from "react";
import { InfoTip } from "./InfoTip";

export const ui = {
  label: {
    fontSize: "$2",
    fontWeight: "$semibold",
    color: "$body",
  } as CSS,
  hint: { fontSize: "$1", color: "$textMiddle", lineHeight: 1.45 } as CSS,
  value: {
    fontSize: "$2",
    fontWeight: "$bold",
    color: "$body",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
  } as CSS,
};

const rangeCss: CSS = {
  width: "100%",
  accentColor: "var(--theme-brand)",
  height: 24,
  margin: 0,
  cursor: "pointer",
  "&:focus-visible": { outline: "2px solid var(--theme-brand)", outlineOffset: 3, borderRadius: 4 },
};

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  hint?: ReactNode;
  /** Default value; shows a reset link when the value differs. */
  defaultValue?: number;
  css?: CSS;
}

/** A labelled native range input (keyboard-operable, screen-reader friendly). */
export function Slider({ label, value, min, max, step, onChange, format, hint, defaultValue, css }: SliderProps) {
  const id = useId();
  const shown = format ? format(value) : String(value);
  const changed = defaultValue !== undefined && Math.abs(defaultValue - value) > 1e-9;
  return (
    <Box css={{ display: "flex", flexDirection: "column", gap: 6, ...css }}>
      <Box css={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
        <Box css={{ display: "flex", alignItems: "center", minWidth: 0 }}>
          <Text as="label" htmlFor={id} css={ui.label}>
            {label}
          </Text>
          {hint && <InfoTip label={label}>{hint}</InfoTip>}
        </Box>
        <Box css={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          {changed && (
            <Box
              as="button"
              type="button"
              onClick={() => onChange(defaultValue!)}
              css={resetCss}
              aria-label={`Reset ${label} to ${format ? format(defaultValue!) : defaultValue}`}
            >
              Reset
            </Box>
          )}
          <Text css={ui.value} aria-hidden="true">
            {shown}
          </Text>
        </Box>
      </Box>
      <Box
        as="input"
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={shown}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(Number(e.target.value))}
        css={rangeCss}
      />
    </Box>
  );
}

const resetCss: CSS = {
  all: "unset",
  cursor: "pointer",
  fontSize: "$1",
  fontWeight: "$semibold",
  color: "var(--theme-cost-link)",
  "&:hover": { textDecoration: "underline" },
  "&:focus-visible": { outline: "2px solid var(--theme-brand)", outlineOffset: 2, borderRadius: 3 },
};

interface ChipOption<T extends string> {
  id: T;
  label: string;
  hint?: string;
}

interface ChipsProps<T extends string> {
  label: string;
  value: T | "custom";
  options: ChipOption<T>[];
  onChange: (id: T) => void;
  hideLabel?: boolean;
  size?: "sm" | "md";
  css?: CSS;
}

/**
 * A radio group drawn as a one-line segmented control. Arrow keys move
 * between options (native radios). The selected option's hint shows as one
 * line underneath rather than under every option.
 */
export function Chips<T extends string>({ label, value, options, onChange, hideLabel, size = "md", css }: ChipsProps<T>) {
  const name = useId();
  const selected = options.find((o) => o.id === value);
  return (
    <Box as="fieldset" css={{ border: 0, padding: 0, margin: 0, minWidth: 0, ...css }}>
      <Text as="legend" css={hideLabel ? srOnly : { ...ui.label, marginBottom: 8, padding: 0 }}>
        {label}
      </Text>
      <Box
        css={{
          display: "grid",
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
          gap: 4,
          padding: 4,
          borderRadius: "$3",
          backgroundColor: "$bg03",
          border: "1px solid $bg05",
        }}
      >
        {options.map((o) => {
          const checked = value === o.id;
          return (
            <Box
              as="label"
              key={o.id}
              css={{
                position: "relative",
                cursor: "pointer",
                borderRadius: 7,
                padding: size === "sm" ? "6px 8px" : "8px 10px",
                textAlign: "center",
                backgroundColor: checked ? "$bg02" : "transparent",
                boxShadow: checked ? "0 1px 3px rgba(0,0,0,.10), inset 0 0 0 1.5px var(--theme-brand)" : "none",
                transition: "background-color .15s, box-shadow .15s",
                "&:hover": { backgroundColor: checked ? "$bg02" : "$bg04" },
                "&:focus-within": { outline: "2px solid var(--theme-brand)", outlineOffset: 1 },
              }}
            >
              <Box as="input" type="radio" name={name} value={o.id} checked={checked} onChange={() => onChange(o.id)} css={srOnly} />
              <Text
                css={{
                  fontSize: size === "sm" ? "$1" : "$2",
                  fontWeight: checked ? "$bold" : "$semibold",
                  color: checked ? "$body" : "$textMiddle",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {o.label}
              </Text>
              {o.hint && <Box as="span" css={srOnly}>{`: ${o.hint}`}</Box>}
            </Box>
          );
        })}
      </Box>
      {size === "md" && (
        <Text css={{ ...ui.hint, marginTop: 6, minHeight: 17 }} aria-hidden="true">
          {value === "custom" ? "Custom: set with the sliders below." : selected?.hint ?? ""}
        </Text>
      )}
    </Box>
  );
}

export const srOnly: CSS = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0,0,0,0)",
  whiteSpace: "nowrap",
  border: 0,
};

interface ToggleProps {
  label: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: ReactNode;
}

export function Toggle({ label, checked, onChange, hint }: ToggleProps) {
  const id = useId();
  return (
    <Box css={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <Box
        as="button"
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        css={{
          all: "unset",
          flexShrink: 0,
          cursor: "pointer",
          width: 38,
          height: 22,
          borderRadius: 999,
          marginTop: 1,
          position: "relative",
          backgroundColor: checked ? "var(--theme-brand)" : "$bg05",
          transition: "background-color .15s",
          "&:focus-visible": { outline: "2px solid var(--theme-brand)", outlineOffset: 2 },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 3,
            left: checked ? 19 : 3,
            width: 16,
            height: 16,
            borderRadius: "50%",
            backgroundColor: "$bg02",
            transition: "left .15s",
          },
        }}
      />
      <Box css={{ display: "flex", alignItems: "center" }}>
        <Text as="label" htmlFor={id} css={{ ...ui.label, cursor: "pointer" }}>
          {label}
        </Text>
        {hint && <InfoTip label={typeof label === "string" ? label : "this setting"}>{hint}</InfoTip>}
      </Box>
    </Box>
  );
}

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  hint?: ReactNode;
  /** Read-only (e.g. a total computed from other inputs). */
  readOnly?: boolean;
  /** Visually hide the label (it still names the field). */
  hideLabel?: boolean;
}

/**
 * A number input that never fights the keyboard: any text is accepted while
 * typing (in-range values apply live), and the value is clamped to its bounds
 * on blur or Enter. Typing 592847 no longer snaps to the minimum after "5".
 */
export function NumberField({ label, value, onChange, min, max, step, suffix, hint, readOnly, hideLabel }: NumberFieldProps) {
  const id = useId();
  const [text, setText] = useState(String(value));
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (!editing) setText(String(value));
  }, [value, editing]);
  const clamp = (v: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, v));
  const commit = () => {
    const v = Number(text.replace(/[,_\s]/g, ""));
    const next = Number.isFinite(v) && text.trim() !== "" ? clamp(v) : value;
    setEditing(false);
    setText(String(next));
    if (next !== value) onChange(next);
  };
  return (
    <Box css={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Box css={{ display: "flex", alignItems: "center", ...(hideLabel ? srOnly : {}) }}>
        <Text as="label" htmlFor={id} css={ui.label}>
          {label}
        </Text>
        {hint && !hideLabel && <InfoTip label={label}>{hint}</InfoTip>}
      </Box>
      <Box css={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Box
          as="input"
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={editing ? text : String(value)}
          readOnly={readOnly}
          aria-readonly={readOnly || undefined}
          data-min={min}
          data-max={max}
          data-step={step}
          onFocus={() => {
            if (readOnly) return;
            setEditing(true);
            setText(String(value));
          }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const t = e.target.value;
            setText(t);
            const v = Number(t.replace(/[,_\s]/g, ""));
            // Apply live only when it's already valid; otherwise wait for blur/Enter.
            if (t.trim() !== "" && Number.isFinite(v) && v === clamp(v)) onChange(v);
          }}
          onBlur={commit}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              commit();
              (e.target as HTMLInputElement).blur();
            }
          }}
          css={{
            width: "100%",
            minWidth: 0,
            fontSize: "$3",
            fontWeight: "$semibold",
            fontVariantNumeric: "tabular-nums",
            color: "$body",
            backgroundColor: readOnly ? "$bg03" : "$bg02",
            border: "1px solid $bg05",
            borderRadius: "$3",
            padding: "9px 12px",
            "&:focus-visible": { outline: "2px solid var(--theme-brand)", outlineOffset: 1 },
          }}
        />
        {suffix && <Text css={{ ...ui.hint, whiteSpace: "nowrap" }}>{suffix}</Text>}
      </Box>
    </Box>
  );
}

/** "Show as table" disclosure under every chart. */
export function TableView({
  summary = "Show as table",
  label,
  children,
}: {
  summary?: string;
  /** Accessible name for the scrollable table region; must be unique on the page. */
  label: string;
  children: ReactNode;
}) {
  return (
    <Box as="details" css={{ marginTop: 12, "& > summary": { cursor: "pointer", ...ui.hint, fontWeight: "$semibold" } }}>
      <Box as="summary">{summary}</Box>
      <Box
        role="region"
        aria-label={label}
        tabIndex={0}
        css={{
          "&:focus-visible": { outline: "2px solid var(--theme-cost-link)", outlineOffset: 2 },
          marginTop: 10,
          overflowX: "auto",
          "& table": { borderCollapse: "collapse", fontSize: "$1", fontVariantNumeric: "tabular-nums", minWidth: "100%" },
          "& th, & td": { textAlign: "right", padding: "5px 10px", borderBottom: "1px solid $bg05", whiteSpace: "nowrap" },
          "& th:first-child, & td:first-child": { textAlign: "left" },
          "& th": { color: "$textMiddle", fontWeight: "$semibold" },
          "& td": { color: "$body" },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
