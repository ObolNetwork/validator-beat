/* eslint-disable @next/next/google-font-display */
import "@components/assessment/stitches";
import { getCssText, styled } from "@obolnetwork/obol-ui";
import { Head, Html, Main, NextScript } from "next/document";

const Body = styled("body", {
  fontFamily: "'DM Sans', system-ui, sans-serif",
  backgroundColor: "var(--bg-01)",
  color: "var(--fg-1)",
});

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <style id="obol" dangerouslySetInnerHTML={{ __html: getCssText() }} />
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
