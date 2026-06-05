export const SITE_NAME = "Validator Beat";
export const SITE_DESCRIPTION =
  "Self-assess how resilient your Ethereum validator setup is — six slices, one stage, nothing stored.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://validatorbeat.com";

export {
  getShareUrl,
  shareNameFromQuery,
  sharePreviewPath,
  SHARE_NAME_MAX,
} from "@lib/share/share-url";
