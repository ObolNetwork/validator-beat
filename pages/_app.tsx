import { globalCss, Provider as TooltipProvider } from "@obolnetwork/obol-ui";
import { SiteLayout } from "@components/layout/SiteLayout";
import { SITE_DESCRIPTION, SITE_NAME } from "@constants/index";
import type { AppProps } from "next/app";
import Head from "next/head";

const globalStyles = globalCss({
  html: {
    overflowX: "hidden",
  },
  body: {
    backgroundColor: "$bg01",
    padding: 0,
    margin: 0,
    fontFamily: "DM Sans, sans-serif",
  },
  a: {
    textDecoration: "none",
  },
  "#__next": {
    position: "relative",
    zIndex: 0,
    minHeight: "100vh",
    backgroundColor: "$bg01",
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

  return (
    <TooltipProvider>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </Head>
      <SiteLayout>
        <Component {...pageProps} />
      </SiteLayout>
    </TooltipProvider>
  );
}
