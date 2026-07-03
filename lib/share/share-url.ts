import { SITE_URL } from "@constants/index";

export const SHARE_NAME_MAX = 25;

export function shareNameFromQuery(search: string): string {
  if (!search) return "";
  const raw = new URLSearchParams(search).get("n");
  if (!raw) return "";
  try {
    const decoded = decodeURIComponent(raw);
    return decoded.slice(0, SHARE_NAME_MAX);
  } catch {
    return raw.slice(0, SHARE_NAME_MAX);
  }
}

export function getShareUrl(code: string, name?: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  const path = `${base}/${code}`;
  const trimmed = name?.trim().slice(0, SHARE_NAME_MAX);
  if (!trimmed) return path;
  return `${path}?n=${encodeURIComponent(trimmed)}`;
}
