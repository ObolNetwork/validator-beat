import {
  ActivityLogIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  ExternalLinkIcon,
} from "@radix-ui/react-icons";
import type { ComponentProps } from "react";

type IconSize = { size?: number };

const iconStyle = (size: number): ComponentProps<"svg">["style"] => ({
  width: size,
  height: size,
  flexShrink: 0,
});

export function IconArrowRight({ size = 16 }: IconSize) {
  return <ArrowRightIcon aria-hidden style={iconStyle(size)} />;
}

export function IconArrowDown({ size = 16 }: IconSize) {
  return <ArrowDownIcon aria-hidden style={iconStyle(size)} />;
}

export function IconExternalLink({ size = 16 }: IconSize) {
  return <ExternalLinkIcon aria-hidden style={iconStyle(size)} />;
}

/** Safety / slashing failure */
export function IconSafety({ size = 24 }: IconSize) {
  return <ExclamationTriangleIcon aria-hidden style={iconStyle(size)} />;
}

/** Liveness / downtime */
export function IconLiveness({ size = 24 }: IconSize) {
  return <ActivityLogIcon aria-hidden style={iconStyle(size)} />;
}
