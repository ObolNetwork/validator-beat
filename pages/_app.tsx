import { globalCss, Provider as TooltipProvider } from "@obolnetwork/obol-ui";
import "@styles/colors_and_type.css";
import "@styles/obol-bridge.css";
import "@styles/pizza.css";
import "@styles/methodology.css";
import { SITE_DESCRIPTION, SITE_NAME } from "@constants/index";
import type { AppProps } from "next/app";
import Head from "next/head";

const globalStyles = globalCss({
  html: {
    overflowX: "hidden",
  },
  body: {
    backgroundColor: "var(--bg-01)",
    color: "var(--fg-1)",
    padding: 0,
    margin: 0,
    fontFamily: "DM Sans, system-ui, sans-serif",
  },
  a: {
    textDecoration: "none",
  },
  "#__next": {
    position: "relative",
    zIndex: 0,
    minHeight: "100vh",
    backgroundColor: "var(--bg-01)",
  },
});

export default function App({ Component, pageProps }: AppProps) {
  globalStyles();

  const title =
    typeof pageProps.title === "string"
      ? `${pageProps.title} | ${SITE_NAME}`
      : SITE_NAME;
  const description =
    typeof pageProps.description === "string"
      ? pageProps.description
      : SITE_DESCRIPTION;
  const ogImage =
    typeof pageProps.ogImage === "string" ? pageProps.ogImage : undefined;
  const canonicalUrl =
    typeof pageProps.canonicalUrl === "string"
      ? pageProps.canonicalUrl
      : undefined;

  return (
    <TooltipProvider>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
        {ogImage && (
          <>
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:image" content={ogImage} />
          </>
        )}
      </Head>
      <Component {...pageProps} />
    </TooltipProvider>
  );
}
