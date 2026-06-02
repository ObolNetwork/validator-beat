import { Box } from "@obolnetwork/obol-ui";
import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

type SiteLayoutProps = {
  children: ReactNode;
};

export function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <Box
      css={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "$bg01",
      }}
    >
      <Navbar />
      <Box
        as="main"
        css={{
          flex: 1,
          width: "100%",
          maxWidth: "1200px",
          mx: "auto",
          px: "$xl",
          py: "$2xl",
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
