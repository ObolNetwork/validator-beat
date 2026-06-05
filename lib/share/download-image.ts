import { toPng } from "html-to-image";

export async function downloadElementAsPng(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const backgroundColor =
    getComputedStyle(document.documentElement)
      .getPropertyValue("--bg-02")
      .trim() || "#ffffff";

  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor,
    skipFonts: true,
    fontEmbedCSS: "",
    filter: (node) => {
      if (node instanceof HTMLLinkElement && node.rel === "stylesheet") {
        const href = node.href;
        if (href && !href.startsWith(window.location.origin)) {
          return false;
        }
      }
      return true;
    },
  });

  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
