import { Box, Text } from "@obolnetwork/obol-ui";
import NextLink from "next/link";
import { Pizza } from "@components/pizza/Pizza";
import {
  Beat,
  BeatPulse,
  Card,
  Eyebrow,
  HeroCard,
  RiskDot,
  TopNavLink,
  risk,
} from "@components/assessment/stitches";
import { SiteHeader } from "@components/layout/SiteHeader";
import { SiteFooter } from "@components/layout/SiteFooter";
import {
  ASSESS_PATH as ASSESS,
  METHODOLOGY_PATH as METHODOLOGY,
  VALOS_URL as VALOS,
} from "@constants/index";
import { SLICES, STAGE_META } from "@lib/rubric";
import type { Answers, SliceId, Stage } from "@lib/rubric/types";
import type { CSS } from "@stitches/react";
import {
  IconArrowDown,
  IconArrowRight,
  IconExternalLink,
  IconLiveness,
  IconSafety,
} from "./icons";

const wrap: CSS = { maxWidth: 1140, margin: "0 auto", padding: "0 28px" };
const section: CSS = { padding: "88px 0", "@media (max-width: 760px)": { padding: "62px 0" } };
const sectionBand: CSS = {
  backgroundColor: "$bg03",
  borderTop: "1px solid $bg05",
  borderBottom: "1px solid $bg05",
};
const sectionHead: CSS = { maxWidth: 760 };
const h1: CSS = {
  fontSize: 56,
  lineHeight: 1.04,
  letterSpacing: "-0.03em",
  fontWeight: "$bold",
  color: "$body",
  margin: 0,
  textWrap: "balance",
  "@media (max-width: 760px)": { fontSize: 40 },
};
const h2: CSS = {
  fontSize: 38,
  lineHeight: 1.1,
  letterSpacing: "-0.025em",
  fontWeight: "$bold",
  color: "$body",
  margin: 0,
  textWrap: "balance",
  "@media (max-width: 760px)": { fontSize: 30 },
};
const h3: CSS = {
  fontSize: 20,
  lineHeight: 1.25,
  letterSpacing: "-0.01em",
  fontWeight: "$bold",
  color: "$body",
  margin: 0,
};
const lede: CSS = {
  fontSize: "$4",
  lineHeight: 1.6,
  color: "$textMiddle",
  marginTop: 20,
  textWrap: "pretty",
  "& strong": { color: "$body", fontWeight: "$semibold" },
};
const prose: CSS = {
  fontSize: "$3",
  lineHeight: 1.65,
  color: "$textMiddle",
  marginTop: 18,
  textWrap: "pretty",
  "& strong": { color: "$body", fontWeight: "$semibold" },
};
const pullQuote: CSS = {
  marginTop: 28,
  fontSize: 21,
  lineHeight: 1.45,
  fontWeight: "$semibold",
  color: "$body",
  letterSpacing: "-0.01em",
  maxWidth: 760,
  textWrap: "pretty",
};
const ctaRow: CSS = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  flexWrap: "wrap",
  marginTop: 32,
};
const primaryLink: CSS = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontSize: "$3",
  fontWeight: "$semibold",
  textDecoration: "none",
  whiteSpace: "nowrap",
  borderRadius: "$3",
  padding: "12px 22px",
  backgroundColor: "var(--theme-brand)",
  color: "var(--theme-text-on-brand)",
  "&:hover": { backgroundColor: "var(--theme-brand-hover)" },
};
const primaryLinkLg: CSS = { ...primaryLink, fontSize: "$4", padding: "14px 28px" };
const ghostLink: CSS = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontSize: "$3",
  fontWeight: "$semibold",
  textDecoration: "none",
  whiteSpace: "nowrap",
  borderRadius: "$3",
  padding: "12px 22px",
  backgroundColor: "transparent",
  color: "$body",
  border: "1px solid $bg05",
  "&:hover": { backgroundColor: "$bg04" },
};
const textLink: CSS = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: "$3",
  fontWeight: "$semibold",
  color: "var(--theme-brand)",
  textDecoration: "none",
  "&:hover": { color: "var(--theme-brand-hover)" },
  "& svg": { transition: "transform 0.15s" },
  "&:hover svg": { transform: "translateX(3px)" },
};
const scrollLink: CSS = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: "$2",
  fontWeight: "$semibold",
  color: "$textMiddle",
  textDecoration: "none",
  "&:hover": { color: "$body" },
};
const heroGrid: CSS = {
  display: "grid",
  gridTemplateColumns: "1.05fr 0.95fr",
  gap: 56,
  alignItems: "center",
  padding: "76px 0 84px",
  "@media (max-width: 900px)": { gridTemplateColumns: "1fr", gap: 40, padding: "52px 0 64px" },
};
const heroPizzaCol: CSS = {
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
  "@media (max-width: 900px)": { order: -1 },
};
const cards2: CSS = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
  marginTop: 44,
  "@media (max-width: 760px)": { gridTemplateColumns: "1fr" },
};
const cardPad: CSS = { padding: 28 };
const stagesGrid: CSS = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 18,
  marginTop: 40,
  "@media (max-width: 760px)": { gridTemplateColumns: "1fr" },
};
const readGrid: CSS = {
  display: "grid",
  gridTemplateColumns: "360px 1fr",
  gap: 48,
  alignItems: "center",
  marginTop: 40,
  "@media (max-width: 900px)": { gridTemplateColumns: "1fr", gap: 32 },
};
const readPizzaCol: CSS = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 14,
  "@media (max-width: 900px)": { order: -1 },
};
const sliceGrid: CSS = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "16px 22px",
  "@media (max-width: 760px)": { gridTemplateColumns: "1fr" },
};
const sidesGrid: CSS = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 22,
  marginTop: 44,
  "@media (max-width: 760px)": { gridTemplateColumns: "1fr" },
};
const valosGrid: CSS = {
  display: "grid",
  gridTemplateColumns: "1fr 320px",
  gap: 48,
  alignItems: "center",
  marginTop: 8,
  "@media (max-width: 900px)": { gridTemplateColumns: "1fr", gap: 28 },
};
const lineage: CSS = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  marginTop: 36,
  flexWrap: "wrap",
};
const lineagePill: CSS = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  padding: "9px 15px",
  borderRadius: "$pill",
  border: "1px solid $bg05",
  backgroundColor: "$bg02",
  fontSize: "$2",
  fontWeight: "$semibold",
  color: "$textMiddle",
};
const lineagePillActive: CSS = {
  ...lineagePill,
  color: "$body",
  borderColor: "var(--theme-brand)",
  backgroundColor: "$bg03",
};
const failIcon: CSS = {
  width: 46,
  height: 46,
  borderRadius: "$3",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 18,
};

const s = {
  wrap,
  section,
  sectionBand,
  sectionHead,
  h1,
  h2,
  h3,
  lede,
  prose,
  pullQuote,
  ctaRow,
  primaryLink,
  primaryLinkLg,
  ghostLink,
  textLink,
  scrollLink,
  heroGrid,
  heroPizzaCol,
  cards2,
  cardPad,
  stagesGrid,
  readGrid,
  readPizzaCol,
  sliceGrid,
  sidesGrid,
  valosGrid,
  lineage,
  lineagePill,
  lineagePillActive,
  failIcon,
};

const HERO_SAMPLE: Answers = {
  keyCustody: "green",
  clientDiversity: "green",
  infraDiversity: "yellow",
  osDiversity: "green",
  cpuDiversity: "red",
  geoDiversity: "yellow",
};

const READ_SAMPLE: Answers = {
  keyCustody: "green",
  clientDiversity: "green",
  infraDiversity: "yellow",
  osDiversity: "green",
  cpuDiversity: "green",
  geoDiversity: "yellow",
};

/** Landing-voice one-liners per slice; canonical labels come from SLICES. */
const SLICE_DESC: Record<SliceId, string> = {
  keyCustody:
    "How signing keys are held, and how many independent parties must cooperate to sign.",
  clientDiversity: "Exposure to a bug in any single consensus or execution client.",
  infraDiversity: "Concentration on a single cloud or hosting provider.",
  osDiversity: "Correlated risk from running a single operating system across the fleet.",
  cpuDiversity: "Correlated risk from running a single chipset across the fleet.",
  geoDiversity: "Concentration in one region and exposure to power failure or natural disaster.",
};

/** Landing-voice detail per stage; naming comes from STAGE_META. */
const STAGE_DESC: Record<Stage, string> = {
  0: "At least one single point of failure remains. Most operators start here — the baseline.",
  1: "No single compromise of one machine, one team member, or one signer can produce a slashable message.",
  2: "No single point of failure in the operator's infrastructure can take the validator offline. This is the end game.",
};

const STAGE_ORDER: Stage[] = [0, 1, 2];

function LHero() {
  return (
    <Box as="header" id="top">
      <Box css={s.wrap}>
        <Box css={s.heroGrid}>
          <Box>
            <Eyebrow as="p" css={{ margin: "0 0 16px" }}>
              A simple view into validator operations
            </Eyebrow>
            <Text as="h1" css={s.h1}>
              The validator ecosystem is missing its{" "}
              <Beat>
                beat
                <BeatPulse aria-hidden="true" />
              </Beat>
              .
            </Text>
            <Text as="p" css={s.lede}>
              When you stake ETH, you pick an operator — sometimes without knowing it. You{" "}
              <strong>cannot</strong> see how they hold their keys, which clients they run, or how
              correlated their setup is with everyone else securing the network. Validator Beat makes
              that visible.
            </Text>
            <Box css={s.ctaRow}>
              <Box as={NextLink} href={ASSESS} css={s.primaryLinkLg}>
                Assess your validator <IconArrowRight size={17} />
              </Box>
              <Box as="a" href="#how" css={s.scrollLink}>
                See how it works <IconArrowDown size={16} />
              </Box>
            </Box>
          </Box>
          <Box css={s.heroPizzaCol}>
            <Pizza answers={HERO_SAMPLE} size={360} showCenter={false} glowOpacity={0.26} />
            <Text css={{ fontSize: "$2", fontWeight: "$semibold", color: "$body" }}>
              An example operator profile
            </Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function LGap() {
  return (
    <Box as="section" css={{ ...s.section, ...s.sectionBand }}>
      <Box css={s.wrap}>
        <Box css={s.sectionHead}>
          <Eyebrow as="p" css={{ margin: "0 0 16px" }}>The gap</Eyebrow>
          <Text as="h2" css={s.h2}>
            Transparency has been built into every layer, except the validators.
          </Text>
        </Box>
        <Box css={s.lineage}>
          {["L2Beat", "Walletbeat"].map((name) => (
            <Box key={name} css={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Text css={s.lineagePill}>
                <Box as="span" css={{ width: 8, height: 8, borderRadius: "$round", backgroundColor: "$textMiddle", opacity: 0.55 }} />
                {name}
              </Text>
              <Box css={{ color: "$textMiddle", display: "flex" }}>
                <IconArrowRight size={16} />
              </Box>
            </Box>
          ))}
          <Text css={s.lineagePillActive}>
            <Box as="span" css={{ width: 8, height: 8, borderRadius: "$round", backgroundColor: "var(--theme-brand)" }} />
            Validator Beat
          </Text>
        </Box>
        <Text as="p" css={{ ...s.prose, maxWidth: 820 }}>
          Rollups have L2Beat. Wallets have Walletbeat. The validator operators securing tens of
          millions of staked ETH have had no way to differentiate themselves outside of performance
          and reputation. Stakers, from ETH holders to institutional allocators, choose an operator or
          protocol and forget about it. Compliance attestations like SOC 2 cover process and custody,
          but they say nothing about the choices that actually determine whether a validator stays safe
          and online: how signing keys are split, whether the operator runs a single client
          implementation, how concentrated their infrastructure is, and how much of that overlaps with
          the rest of the network.
        </Text>
        <Text as="p" css={s.pullQuote}>
          That invisible risk is <Text as="span" css={{ display: "inline", color: "var(--theme-brand)" }}>unpriced</Text>.
          {" "}Validator Beat is the public entry point that compares these risks and gives operators a
          reason to compete on it.
        </Text>
      </Box>
    </Box>
  );
}

function LFail() {
  return (
    <Box as="section" css={s.section}>
      <Box css={s.wrap}>
        <Box css={s.sectionHead}>
          <Eyebrow as="p" css={{ margin: "0 0 16px" }}>Why it matters</Eyebrow>
          <Text as="h2" css={s.h2}>How validators actually fail</Text>
          <Text as="p" css={s.lede}>
            There are two ways a validator fails, and decentralization is the insurance against both.
          </Text>
        </Box>
        <Box css={s.cards2}>
          <Card as="article" css={s.cardPad}>
            <Box css={{ ...s.failIcon, backgroundColor: risk.redT, color: risk.red }}>
              <IconSafety size={24} />
            </Box>
            <Text css={{ fontSize: "$1", fontWeight: "$bold", textTransform: "uppercase", letterSpacing: "0.05em", color: risk.red, marginBottom: 6 }}>
              Safety failure · slashing
            </Text>
            <Text as="h3" css={s.h3}>It signs something it never should have.</Text>
            <Text css={{ fontSize: "$3", lineHeight: 1.6, color: "$textMiddle", marginTop: 8 }}>
              A double attestation, or a supermajority vote on the wrong chain. The protocol slashes
              the stake. This is the expensive failure.
            </Text>
          </Card>
          <Card as="article" css={s.cardPad}>
            <Box css={{ ...s.failIcon, backgroundColor: risk.yellowT, color: risk.yellow }}>
              <IconLiveness size={24} />
            </Box>
            <Text css={{ fontSize: "$1", fontWeight: "$bold", textTransform: "uppercase", letterSpacing: "0.05em", color: risk.yellow, marginBottom: 6 }}>
              Liveness failure · downtime
            </Text>
            <Text as="h3" css={s.h3}>It goes offline and misses its duties.</Text>
            <Text css={{ fontSize: "$3", lineHeight: 1.6, color: "$textMiddle", marginTop: 8 }}>
              No slashing, but no rewards either, and a weaker network. The validator simply isn&apos;t
              there when it&apos;s needed.
            </Text>
          </Card>
        </Box>
        <Text as="p" css={{ ...s.prose, marginTop: 28, maxWidth: 820 }}>
          Most safety and liveness issues trace back to a <strong>single point of failure</strong>:
          one machine, one team member, one client, one provider, one region. Validator Beat measures
          how many of those single points of failure an operator has removed.
        </Text>
      </Box>
    </Box>
  );
}

function LRead() {
  return (
    <Box as="section" css={{ ...s.section, ...s.sectionBand }} id="how">
      <Box css={s.wrap}>
        <Box css={s.sectionHead}>
          <Eyebrow as="p" css={{ margin: "0 0 16px" }}>The assessment</Eyebrow>
          <Text as="h2" css={s.h2}>How Validator Beat assesses an operator</Text>
          <Text as="p" css={s.lede}>
            Six questions build a six-slice risk profile, and the slices roll up into a Stage.
            Most operators start at Stage 0, with two stages to climb.
          </Text>
        </Box>
        <Box css={s.stagesGrid}>
          {STAGE_ORDER.map((n) => {
            const { name, kind, tone } = STAGE_META[n];
            return (
              <HeroCard key={n} tone={tone} css={{ marginBottom: 0 }}>
                <Box css={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <Box css={{ width: 40, height: 40, borderRadius: "$3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#fff", backgroundColor: risk[tone] }}>
                    {n}
                  </Box>
                  <Box>
                    <Text css={{ fontSize: "$4", fontWeight: "$bold", color: "$body" }}>
                      {name} — {kind}
                    </Text>
                    <Text css={{ fontSize: "$2", fontWeight: "$bold", color: risk[tone] }}>
                      {STAGE_META[n].tagline}
                    </Text>
                  </Box>
                </Box>
                <Text css={{ fontSize: "$3", lineHeight: 1.55, color: "$textMiddle" }}>
                  {STAGE_DESC[n]}
                </Text>
              </HeroCard>
            );
          })}
        </Box>
        <Box css={s.readGrid}>
          <Box css={s.readPizzaCol}>
            <Pizza answers={READ_SAMPLE} size={300} showCenter={false} glowOpacity={0.26} />
            <Text css={{ fontSize: "$2", color: "$textMiddle", textAlign: "center" }}>
              Each slice scored{" "}
              <Text as="span" css={{ display: "inline", fontWeight: "$bold", color: risk.green }}>green</Text>,{" "}
              <Text as="span" css={{ display: "inline", fontWeight: "$bold", color: risk.yellow }}>yellow</Text>, or{" "}
              <Text as="span" css={{ display: "inline", fontWeight: "$bold", color: risk.red }}>red</Text>
            </Text>
          </Box>
          <Box css={s.sliceGrid}>
            {SLICES.map(({ id, label }) => (
              <Box key={id}>
                <Box css={{ display: "flex", alignItems: "center", gap: 8, fontWeight: "$bold", fontSize: "$3", color: "$body" }}>
                  <RiskDot color={READ_SAMPLE[id]} size="md" css={{ marginTop: 0 }} />
                  {label}
                </Box>
                <Text css={{ fontSize: "$2", lineHeight: 1.5, color: "$textMiddle", marginTop: 4 }}>
                  {SLICE_DESC[id]}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
        <Text as="p" css={{ ...s.prose, marginTop: 34 }}>
          This can be read at a glance. For the exact thresholds and rubric, see the{" "}
          <Box as={NextLink} href={METHODOLOGY} css={s.textLink}>methodology</Box>. To see where your
          own validator lands,{" "}
          <Box as={NextLink} href={ASSESS} css={s.textLink}>
            take the assessment <IconArrowRight size={15} />
          </Box>
          .
        </Text>
        <Text css={{ marginTop: 14, fontSize: "$2", fontStyle: "italic", color: "$textMiddle" }}>
          Validator Beat is self-reported and consent-based.
        </Text>
      </Box>
    </Box>
  );
}

function LSides() {
  return (
    <Box as="section" css={s.section}>
      <Box css={s.wrap}>
        <Box css={s.sectionHead}>
          <Eyebrow as="p" css={{ margin: "0 0 16px" }}>Who it&apos;s for</Eyebrow>
          <Text as="h2" css={s.h2}>Built for both sides of the stake</Text>
        </Box>
        <Box css={s.sidesGrid}>
          <Card css={{ ...s.cardPad, display: "flex", flexDirection: "column" }}>
            <Eyebrow as="p" css={{ margin: "0 0 12px" }}>If you delegate your ETH</Eyebrow>
            <Text as="h3" css={{ ...s.h3, fontSize: 22, marginBottom: 12 }}>
              Read any operator&apos;s profile in five seconds.
            </Text>
            <Text css={{ fontSize: "$3", lineHeight: 1.6, color: "$textMiddle" }}>
              Before you stake, not after an incident. A Stage and six colors give you insight into
              validator operations that the marketing page never will.
            </Text>
          </Card>
          <Card css={{ ...s.cardPad, display: "flex", flexDirection: "column" }}>
            <Eyebrow as="p" css={{ margin: "0 0 12px" }}>If you&apos;re an operatooor</Eyebrow>
            <Text as="h3" css={{ ...s.h3, fontSize: 22, marginBottom: 12 }}>Proof of work.</Text>
            <Text css={{ fontSize: "$3", lineHeight: 1.6, color: "$textMiddle" }}>
              Run the assessment, earn your stages, and show off your pizza wherever you list your
              product. Operators who have removed their single points of failure now have a way to show
              it.
            </Text>
            <Box css={{ marginTop: 22 }}>
              <Box as={NextLink} href={ASSESS} css={s.primaryLink}>
                Assess your validator <IconArrowRight size={16} />
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

function LValos() {
  return (
    <Box as="section" css={{ ...s.section, ...s.sectionBand }}>
      <Box css={s.wrap}>
        <Box css={s.valosGrid}>
          <Box>
            <Eyebrow as="p" css={{ margin: "0 0 16px" }}>The standard behind the score</Eyebrow>
            <Text as="h2" css={s.h2}>Validator Beat and valOS</Text>
            <Text as="p" css={s.prose}>
              Validator Beat is the public-facing <strong>who</strong>: which operators run
              validators, and how resilient their setups are. valOS, the Validator Operating
              Standard, is the technical <strong>how</strong>: a deep catalog of the controls and
              mitigations behind professional validator operations.
            </Text>
            <Text as="p" css={s.prose}>
              A staker can quickly read an operator&apos;s stage and profile here. An operator doing
              the hard work and implementing the mitigations should dig into valOS. Follow valOS, and
              you&apos;ll end up at Stage 2.
            </Text>
            <Box css={s.ctaRow}>
              <Box as="a" href={VALOS} target="_blank" rel="noopener noreferrer" css={s.ghostLink}>
                Learn more about valOS <IconExternalLink size={16} />
              </Box>
            </Box>
          </Box>
          <Box css={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Card css={{ padding: "18px 20px" }}>
              <Eyebrow as="p" css={{ margin: 0 }}>Validator Beat</Eyebrow>
              <Text css={{ fontSize: "$3", fontWeight: "$semibold", color: "$body", marginTop: 4 }}>
                The <Text as="span" css={{ display: "inline", color: "var(--theme-brand)" }}>who</Text> — the public dashboard
              </Text>
            </Card>
            <Box css={{ display: "flex", justifyContent: "center", color: "$textMiddle" }}>
              <IconArrowDown size={20} />
            </Box>
            <Card css={{ padding: "18px 20px" }}>
              <Eyebrow as="p" css={{ margin: 0 }}>valOS</Eyebrow>
              <Text css={{ fontSize: "$3", fontWeight: "$semibold", color: "$body", marginTop: 4 }}>
                The <Text as="span" css={{ display: "inline", color: "var(--theme-brand)" }}>how</Text> — the operating standard
              </Text>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function LNeutral() {
  return (
    <Box as="section" css={s.section}>
      <Box css={s.wrap}>
        <Box css={s.sectionHead}>
          <Eyebrow as="p" css={{ margin: "0 0 16px" }}>Credibility</Eyebrow>
          <Text as="h2" css={s.h2}>A neutral dashboard, built in the open</Text>
          <Text as="p" css={s.prose}>
            Validator Beat is co-authored by Obol and Lido. It is deliberately neutral and no single
            team owns the rubric. The methodology is public and is meant to be adopted, challenged,
            and improved by the whole ecosystem.
          </Text>
          <Text as="p" css={s.prose}>
            The goal is a <strong>race to the top</strong>, where transparency about validator risk
            becomes the default expectation.
          </Text>
          <Box css={{ display: "flex", alignItems: "center", gap: 14, marginTop: 30, flexWrap: "wrap" }}>
            {[
              { name: "Obol", color: "var(--theme-brand)" },
              { name: "Lido", color: "#00a3ff" },
            ].map(({ name, color }) => (
              <Box key={name} css={{ display: "inline-flex", alignItems: "center", gap: 9, padding: "11px 18px", borderRadius: "$3", border: "1px solid $bg05", backgroundColor: "$bg02", fontSize: "$3", fontWeight: "$bold", color: "$body" }}>
                <Box css={{ width: 9, height: 9, borderRadius: "$round", backgroundColor: color }} />
                {name}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function LClosing() {
  return (
    <Box as="section" css={{ ...s.section, ...s.sectionBand, textAlign: "center" }}>
      <Box css={s.wrap}>
        <Text as="h2" css={{ ...s.h2, maxWidth: "16ch", margin: "0 auto" }}>
          Find out how secure your validator really is.
        </Text>
        <Box css={{ ...s.ctaRow, justifyContent: "center", marginTop: 34 }}>
          <Box as={NextLink} href={ASSESS} css={s.primaryLinkLg}>
            Assess your validator <IconArrowRight size={17} />
          </Box>
        </Box>
        <Box css={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, flexWrap: "wrap", marginTop: 20 }}>
          <TopNavLink href={METHODOLOGY}>Read the methodology</TopNavLink>
          <Text css={{ color: "$textMiddle" }}>·</Text>
          <Box as="a" href={VALOS} target="_blank" rel="noopener noreferrer" css={{ fontSize: "$2", fontWeight: "$medium", color: "$textMiddle", textDecoration: "none", "&:hover": { color: "$body" } }}>
            Explore valOS
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function Landing() {
  return (
    <Box css={{ minHeight: "100vh", backgroundColor: "$bg01", color: "$textMiddle" }}>
      <SiteHeader />
      <LHero />
      <LGap />
      <LFail />
      <LRead />
      <LSides />
      <LValos />
      <LNeutral />
      <LClosing />
      <SiteFooter />
    </Box>
  );
}
