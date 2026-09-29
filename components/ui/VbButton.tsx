import { Button } from "@obolnetwork/obol-ui";
import type { ComponentProps } from "react";

type VbButtonProps = Omit<ComponentProps<typeof Button>, "variant" | "color"> & {
  variant?: "primary" | "secondary";
};

/**
 * obol-ui Button in the Validator Beat palette. obol-ui picks its look via the
 * `color` variant (its `variant` prop is for nav/tx/wallet buttons), and its
 * hover state swaps in its own text color — so both variants pin text color
 * on hover to keep contrast in light and dark themes.
 */
export function VbButton({ className, css, variant = "primary", ...props }: VbButtonProps) {
  const look =
    variant === "primary"
      ? {
          backgroundColor: "var(--theme-brand)",
          color: "var(--theme-text-on-brand)",
          "&:hover": {
            backgroundColor: "var(--theme-brand-hover)",
            color: "var(--theme-text-on-brand)",
          },
        }
      : {
          backgroundColor: "$bg03",
          color: "$body",
          border: "2px solid $bg05",
          "&:hover": { backgroundColor: "$bg04", color: "$body", border: "2px solid $bg05" },
        };
  return (
    <Button
      className={className}
      color={variant}
      css={{ ...look, "&:disabled": { opacity: 0.5 }, ...css }}
      {...props}
    />
  );
}
