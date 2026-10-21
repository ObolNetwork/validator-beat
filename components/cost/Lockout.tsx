import { Box, Text } from "@obolnetwork/obol-ui";
import NextLink from "next/link";
import { Card } from "@components/assessment/stitches";
import { ASSESS_PATH, DOWNTIME_CALCULATOR_URL } from "@constants/index";
import { Anchor } from "./Anchor";
import { Ref } from "./refs";
import * as s from "./styles";

/**
 * Why the numbers on this page understate a Stage 0 setup's worst case:
 * a supermajority client bug can trap validators on a justified wrong fork.
 * Figures from the downtime calculator's lockout simulation (lockoutLoss),
 * Holešky facts from the EF post-mortem only.
 */
export function Lockout({ compact = false }: { compact?: boolean }) {
  return (
    <Card
      as="section"
      aria-labelledby="wrong-fork-lockout"
      css={{
        ...s.cardPad,
        borderColor: "var(--vb-red-b)",
        borderLeftWidth: 4,
        backgroundColor: "$bg02",
      }}
    >
      <Text css={{ fontSize: "$1", fontWeight: "$bold", textTransform: "uppercase", letterSpacing: "0.05em", color: "$textMiddle" }}>
        Read this as a floor
      </Text>
      <Anchor as="h3" id="wrong-fork-lockout" css={{ ...s.h3, marginTop: 6 }}>
        The worst case isn&apos;t on this page: a client bug can lock you out
      </Anchor>
      <Text as="p" css={{ ...s.prose, maxWidth: 900 }}>
        These figures price a key compromise at one operator. A bug in the clients most of the network runs can cost
        far more: on the Holešky testnet in February 2025, validators were trapped on an invalid chain
        <Ref k="holesky" />. On mainnet, a lockout like that would cost each trapped validator about{" "}
        <strong>72–93% of its balance</strong>
        <Ref k="lockout" />. A multi-operator DV with diverse clients across its key shares is far less exposed.
      </Text>
      {compact ? (
        <Box
          as="details"
          css={{ marginTop: 12, "& > summary": { cursor: "pointer", fontSize: "$2", fontWeight: "$semibold", color: s.LINK, textDecoration: "underline" } }}
        >
          <Box as="summary">How a lockout works, and the numbers</Box>
          <Detail />
        </Box>
      ) : (
        <Detail />
      )}
      <Text css={{ ...s.small, marginTop: 12, maxWidth: 900 }}>
        This page does not add lockouts to its totals or its odds: how often they happen and how they play out on mainnet
        are far less certain than slashing mechanics.
      </Text>
    </Card>
  );
}

function Detail() {
  return (
    <>
      <Text as="p" css={{ ...s.prose, maxWidth: 900 }}>
        Everything above prices a key compromise at one operator. A bug shared by the clients most of the network runs can
        cost more. If <strong>⅔ or more of stake</strong> follows the same invalid chain and justifies it, those validators
        can&apos;t vote on the correct chain without a surround slashing. So they stay offline while the inactivity leak
        drains them, until the honest side holds ⅔ of what&apos;s left
        <Ref k="inactivity" />.
      </Text>
      <Text as="p" css={{ ...s.prose, maxWidth: 900 }}>
        That happened on the Holešky testnet in February 2025. Geth, Nethermind and Besu shipped the wrong deposit
        contract address and accepted an invalid block. The invalid chain was justified at epoch 115,968, and the network
        then ran two weeks without finality
        <Ref k="holesky" />
        <Ref k="holesky-debrief" />. Those three clients run roughly 94% of mainnet stake today, according to{" "}
        <a href="https://clientdiversity.org/" target="_blank" rel="noopener noreferrer">
          clientdiversity.org
        </a>
        <Ref k="clients" />. The downtime calculator lists{" "}
        <a href={`${DOWNTIME_CALCULATOR_URL}/#when-clients-fail-together`} target="_blank" rel="noopener noreferrer">
          which client combinations are large enough to cause a lockout today
        </a>
        .
      </Text>
      <Text as="p" css={{ ...s.prose, maxWidth: 900 }}>
        At mainnet scale, a lockout of 67–94% of stake would cost each trapped validator about{" "}
        <strong>72–93% of its balance</strong> over 30–45 days
        <Ref k="lockout" />. That is three to four times the ~20% this page shows when a whole 10% operator is slashed, and it
        doesn&apos;t depend on your operator&apos;s size, only on your clients&apos;. So the losses above understate what a
        solo-operator setup risks. A multi-operator DV with diverse clients across its key shares has a smaller lockout risk: one
        client&apos;s bad vote can&apos;t reach the signing threshold, so the cluster misses those duties instead of signing
        the wrong chain. See the{" "}
        <Box as={NextLink} href={`${ASSESS_PATH}`} css={{ color: s.LINK, fontWeight: "$semibold" }}>
          Client Diversity slice
        </Box>{" "}
        of the assessment.
      </Text>
    </>
  );
}
