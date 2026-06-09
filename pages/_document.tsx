/* eslint-disable @next/next/google-font-display */
import "@components/assessment/stitches";
import { getCssText, styled } from "@obolnetwork/obol-ui";
import { Head, Html, Main, NextScript } from "next/document";

const Body = styled("body", {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  backgroundColor: "var(--bg-01)",
  color: "var(--fg-1)",
});

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        <style id="obol" dangerouslySetInnerHTML={{ __html: getCssText() }} />
        <link rel="icon" type="image/svg+xml" href={`${BASE_PATH}/icon.svg`} />
        <link rel="icon" type="image/png" sizes="32x32" href={`${BASE_PATH}/favicon-32.png`} />
        <link rel="icon" type="image/png" sizes="16x16" href={`${BASE_PATH}/favicon-16.png`} />
        <link rel="apple-touch-icon" sizes="180x180" href={`${BASE_PATH}/apple-touch-icon.png`} />
        <link rel="manifest" href={`${BASE_PATH}/site.webmanifest`} />
        <meta name="theme-color" content="#16968E" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Body>
        <Main />
        <NextScript />
      </Body>
    </Html>
  );
}
