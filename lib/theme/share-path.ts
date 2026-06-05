/** Six-letter G/Y/R share code in the URL path, e.g. /GYRYGG/ */
export const SHARE_CODE_PATH = /^\/([gyr]{6})\/?$/i;

export function shareCodeFromPath(pathname: string): string | null {
  const m = pathname.match(SHARE_CODE_PATH);
  return m ? m[1].toUpperCase() : null;
}
