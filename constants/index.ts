export const SITE_NAME = "Validator Beat";
export const SITE_DESCRIPTION =
  "Self-assess how resilient your Ethereum validator setup is — six slices, one stage, nothing stored.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://validatorbeat.com";

/** Canonical internal routes + external links used across the shared site chrome. */
export const ASSESS_PATH = "/assess/";
export const METHODOLOGY_PATH = "/methodology/";
export const VALOS_URL = "https://lidofinance.github.io/valos/valos-spec.html";

export {
  getShareUrl,
  shareNameFromQuery,
  SHARE_NAME_MAX,
} from "@lib/share/share-url";
