import { Box, Text } from "@obolnetwork/obol-ui";
import type { CSS } from "@stitches/react";
import { useId, type ReactNode } from "react";

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
        <Text as="label" htmlFor={id} css={ui.label}>
          {label}
        </Text>
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
      {hint && <Text css={ui.hint}>{hint}</Text>}
    </Box>
  );
}

const resetCss: CSS = {
  all: "unset",
  cursor: "pointer",
  fontSize: "$1",
  fontWeight: "$semibold",
  color: "var(--theme-brand)",
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

/** A radio group drawn as chips. Arrow keys move between options. */
export function Chips<T extends string>({ label, value, options, onChange, hideLabel, size = "md", css }: ChipsProps<T>) {
  const name = useId();
  return (
    <Box as="fieldset" css={{ border: 0, padding: 0, margin: 0, minWidth: 0, ...css }}>
      <Text
        as="legend"
        css={hideLabel ? srOnly : { ...ui.label, marginBottom: 8, padding: 0 }}
      >
        {label}
      </Text>
      <Box css={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((o) => {
          const checked = value === o.id;
          return (
            <Box
              as="label"
              key={o.id}
              title={o.hint}
              css={{
                position: "relative",
                display: "inline-flex",
                flexDirection: "column",
                gap: 1,
                cursor: "pointer",
                borderRadius: "$3",
                border: "1px solid",
                borderColor: checked ? "var(--theme-brand)" : "$bg05",
                backgroundColor: checked ? "$bg03" : "$bg02",
                padding: size === "sm" ? "6px 11px" : "9px 14px",
                transition: "border-color .15s, background-color .15s",
                "&:hover": { borderColor: checked ? "var(--theme-brand)" : "var(--theme-border-strong)" },
                "&:focus-within": { outline: "2px solid var(--theme-brand)", outlineOffset: 2 },
              }}
            >
              <Box
                as="input"
                type="radio"
                name={name}
                value={o.id}
                checked={checked}
                onChange={() => onChange(o.id)}
                css={srOnly}
              />
              <Text
                css={{
                  fontSize: size === "sm" ? "$1" : "$2",
                  fontWeight: "$semibold",
                  color: checked ? "$body" : "$textMiddle",
                  whiteSpace: "nowrap",
                }}
              >
                {checked && (
                  <Box as="span" aria-hidden="true" css={{ color: "var(--theme-brand)", marginRight: 5 }}>
                    ●
                  </Box>
                )}
                {o.label}
              </Text>
              {o.hint && size === "md" && (
                <Text css={{ fontSize: 11, color: "$textMiddle", whiteSpace: "nowrap" }}>{o.hint}</Text>
              )}
            </Box>
          );
        })}
        {value === "custom" && (
          <Text css={{ ...ui.hint, alignSelf: "center", fontStyle: "italic" }}>Custom</Text>
        )}
      </Box>
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
      <Box>
        <Text as="label" htmlFor={id} css={{ ...ui.label, cursor: "pointer" }}>
          {label}
        </Text>
        {hint && <Text css={{ ...ui.hint, marginTop: 3 }}>{hint}</Text>}
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
}

export function NumberField({ label, value, onChange, min, max, step, suffix, hint }: NumberFieldProps) {
  const id = useId();
  return (
    <Box css={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <Text as="label" htmlFor={id} css={ui.label}>
        {label}
      </Text>
      <Box css={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Box
          as="input"
          id={id}
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const v = Number(e.target.value);
            if (Number.isFinite(v)) onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, v)));
          }}
          css={{
            width: "100%",
            minWidth: 0,
            fontSize: "$3",
            fontWeight: "$semibold",
            fontVariantNumeric: "tabular-nums",
            color: "$body",
            backgroundColor: "$bg02",
            border: "1px solid $bg05",
            borderRadius: "$3",
            padding: "9px 12px",
            "&:focus-visible": { outline: "2px solid var(--theme-brand)", outlineOffset: 1 },
          }}
        />
        {suffix && <Text css={{ ...ui.hint, whiteSpace: "nowrap" }}>{suffix}</Text>}
      </Box>
      {hint && <Text css={ui.hint}>{hint}</Text>}
    </Box>
  );
}

/** "Show as table" disclosure under every chart. */
export function TableView({ summary = "Show as table", children }: { summary?: string; children: ReactNode }) {
  return (
    <Box as="details" css={{ marginTop: 12, "& > summary": { cursor: "pointer", ...ui.hint, fontWeight: "$semibold" } }}>
      <Box as="summary">{summary}</Box>
      <Box
        css={{
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
