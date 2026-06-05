import { Button } from "@obolnetwork/obol-ui";
import type { ComponentProps } from "react";

type VbButtonProps = ComponentProps<typeof Button>;

/** obol-ui Button — Lido brand blue (#00A3FF), not obolGreen mint. */
export function VbButton({ className, css, variant, ...props }: VbButtonProps) {
  const isPrimary = variant !== "secondary";
  return (
    <Button
      className={className}
      variant={variant}
      css={{
        ...(isPrimary
          ? {
              backgroundColor: "var(--theme-brand)",
              color: "var(--theme-text-on-brand)",
              "&:hover": { backgroundColor: "var(--theme-brand-hover)" },
              "&:disabled": { opacity: 0.5 },
            }
          : {}),
        ...css,
      }}
      {...props}
    />
  );
}
