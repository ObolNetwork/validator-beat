import { Box, Link, Text } from "@obolnetwork/obol-ui";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { SITE_NAME } from "@constants/index";

const NAV_ITEMS = [
  { href: "/", label: "Manifesto" },
  { href: "/operators/", label: "Operators" },
  { href: "/methodology/", label: "Methodology" },
] as const;

export function Navbar() {
  const router = useRouter();

  return (
    <Box
      as="header"
      css={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: "$xl",
        py: "$md",
        borderBottom: "1px solid $bg05",
        backgroundColor: "$bg01",
      }}
    >
      <NextLink href="/" passHref legacyBehavior>
        <Link css={{ textDecoration: "none" }}>
          <Text variant="h4" css={{ color: "$body", fontWeight: "$semibold" }}>
            {SITE_NAME}
          </Text>
        </Link>
      </NextLink>
      <Box as="nav" css={{ display: "flex", gap: "$lg" }}>
        {NAV_ITEMS.map(({ href, label }) => {
          const active =
            href === "/"
              ? router.pathname === "/"
              : router.pathname.startsWith(href.replace(/\/$/, ""));
          return (
            <NextLink key={href} href={href} passHref legacyBehavior>
              <Link
                css={{
                  color: active ? "$obolGreen" : "$body",
                  fontWeight: active ? "$semibold" : "$normal",
                  textDecoration: "none",
                  "&:hover": { color: "$obolGreen" },
                }}
              >
                {label}
              </Link>
            </NextLink>
          );
        })}
      </Box>
    </Box>
  );
}
