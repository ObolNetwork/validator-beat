import { SITE_URL } from "@constants/index";
import { decodeShareCode } from "@lib/rubric";

export const SHARE_NAME_MAX = 40;

/** Another result to compare against, carried in the URL as ?vs=CODE&vn=Name. */
export type CompareTarget = { code: string; name: string };

function cleanName(raw: string | null): string {
  if (!raw) return "";
  return raw.trim().slice(0, SHARE_NAME_MAX);
}

export type ShareQuery = { name: string; compare: CompareTarget | null };

/** Parse ?n= (owner name) and ?vs=/&vn= (comparison) from a location.search string. */
export function parseShareQuery(search: string): ShareQuery {
  const q = new URLSearchParams(search);
  const vs = (q.get("vs") ?? "").toUpperCase();
  return {
    name: cleanName(q.get("n")),
    compare: decodeShareCode(vs) ? { code: vs, name: cleanName(q.get("vn")) } : null,
  };
}

function siteBase(): string {
  return SITE_URL.replace(/\/$/, "");
}

function query(params: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

/** Absolute share URL for a result, optionally naming it and pinning a comparison. */
export function getShareUrl(code: string, name?: string, compare?: CompareTarget | null): string {
  return `${siteBase()}/${code}${query({
    n: cleanName(name ?? null),
    vs: compare?.code,
    vn: compare ? cleanName(compare.name) : undefined,
  })}`;
}

/** In-app route (basePath-relative, for next/link or router.push) to take the assessment against a result. */
export function compareAssessPath(target: CompareTarget): string {
  return `/assess/${query({ vs: target.code, vn: cleanName(target.name) })}`;
}

/** Absolute URL of the pre-rendered README/website badge for a result. */
export function badgeUrl(code: string): string {
  return `${siteBase()}/badge/${code}.svg`;
}
