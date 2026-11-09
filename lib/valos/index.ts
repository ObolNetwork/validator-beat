import { VALOS_URL } from "@constants/index";
import type { SliceId } from "@lib/rubric/types";

/** A link into the ValOS spec, by the spec's own section id. */
export const valosLink = (anchor: string): string => `${VALOS_URL}#${anchor}`;

export type ValosControl = {
  /** Section number in the ValOS Controls Catalog (§5). */
  id: string;
  title: string;
  /** RFC 2119 level of the control's main requirement. */
  level: "MUST" | "SHOULD";
  anchor: string;
};

const control = (id: string, title: string, level: ValosControl["level"], anchor: string): ValosControl => ({
  id,
  title,
  level,
  anchor,
});

/**
 * The ValOS controls closest to each slice. A slice is a resilience question, not a
 * control test: answering green does not show conformance with these controls, and
 * meeting them does not by itself make a slice green.
 */
export const VALOS_CONTROLS: Record<SliceId, ValosControl[]> = {
  keyCustody: [
    control("5.5.1", "Key Management", "MUST", "ctrl-key-management"),
    control("5.4.3", "Signature management", "MUST", "ctrl-signature-management"),
  ],
  clientDiversity: [
    control("5.4.4", "Client Diversity", "MUST", "ctrl-client-diversity"),
    control("5.4.2", "Anti-slashing Database", "MUST", "ctrl-anti-slashing-database"),
  ],
  infraDiversity: [
    control("5.8.2", "Distribute Validators physically", "SHOULD", "ctrl-distribute-validators-physically"),
  ],
  osDiversity: [
    control("5.4.1", "Keep Software Updated", "MUST", "ctrl-keep-software-updated"),
    control(
      "5.9.4",
      "Check Third-party Code for Vulnerabilities before Updating",
      "MUST",
      "ctrl-check-third-party-code-for-vulnerabilities-before-updating",
    ),
  ],
  cpuDiversity: [
    control("5.4.5", "Secure Devices", "MUST", "ctrl-secure-devices"),
    control("5.8.3", "Manage Equipment Lifecycles", "SHOULD", "ctrl-manage-equipment-lifecycles"),
  ],
  geoDiversity: [
    control("5.8.2", "Distribute Validators physically", "SHOULD", "ctrl-distribute-validators-physically"),
    control("5.8.1", "Manage Environmental Threats", "SHOULD", "ctrl-manage-environmental-threats"),
  ],
};

/** Shown wherever a result sits next to ValOS, so a Stage is never read as a ValOS claim. */
export const NOT_VALOS_CONFORMANCE =
  "A Validator Beat Stage measures resilience to single points of failure. It is not a ValOS assessment or certification, and doesn't show conformance with any ValOS control.";
