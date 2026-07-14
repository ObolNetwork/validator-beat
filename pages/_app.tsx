import { AppThemeProvider } from "@components/AppThemeProvider";
import { globalCss, Provider as TooltipProvider } from "@obolnetwork/obol-ui";
import "@styles/colors_and_type.css";
import "@styles/obol-bridge.css";
import "@styles/pizza.css";
import "@styles/methodology.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@constants/index";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";

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
  const router = useRouter();

  const title =
    typeof pageProps.title === "string"
      ? `${pageProps.title} | ${SITE_NAME}`
      : SITE_NAME;
  const description =
    typeof pageProps.description === "string"
      ? pageProps.description
      : SITE_DESCRIPTION;

  const base = SITE_URL.replace(/\/$/, "");
  // Every page shares one OG image unless it brings its own (share results do).
  const ogImage =
    typeof pageProps.ogImage === "string"
      ? pageProps.ogImage
      : `${base}/og/landing.png`;
  // Canonical falls back to the route itself (trailingSlash: true everywhere).
  const routePath = router.asPath.split(/[?#]/)[0];
  const canonicalUrl =
    typeof pageProps.canonicalUrl === "string"
      ? pageProps.canonicalUrl
      : `${base}${routePath.endsWith("/") ? routePath : `${routePath}/`}`;

  return (
    <AppThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      storageKey="vb-theme"
      enableSystem={false}
    >
      <TooltipProvider>
        <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        </Head>
        <Component {...pageProps} />
      </TooltipProvider>
    </AppThemeProvider>
  );
}
