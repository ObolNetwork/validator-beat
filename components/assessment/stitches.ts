import { Box, Text, styled } from "@obolnetwork/obol-ui";
import type { SliceColor } from "@lib/rubric/types";
import NextLink from "next/link";

/** Validator Beat risk palette — maps to theme-tokens.css */
export const risk = {
  green: "var(--vb-green)",
  yellow: "var(--vb-yellow)",
  red: "var(--vb-red)",
  greenT: "var(--vb-green-t)",
  yellowT: "var(--vb-yellow-t)",
  redT: "var(--vb-red-t)",
  greenB: "var(--vb-green-b)",
  yellowB: "var(--vb-yellow-b)",
  redB: "var(--vb-red-b)",
  empty: "var(--vb-empty)",
  emptyStroke: "var(--vb-empty-stroke)",
} as const;

export const brand = {
  main: "var(--theme-brand)",
  hover: "var(--theme-brand-hover)",
  highlight: "var(--theme-brand-highlight)",
} as const;

export type RiskTone = SliceColor;

/* ---- Assessment shell --------------------------------------------------- */

export const Shell = styled(Box, {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  maxWidth: 1440,
  margin: "0 auto",
  "@media (max-width: 880px)": {
    height: "auto",
    minHeight: "100vh",
  },
});

export const TopBar = styled(Box, {
  display: "flex",
  alignItems: "center",
  gap: "$xs",
  padding: "$xs $xl",
  flexShrink: 0,
});

export const BrandLink = styled(NextLink, {
  fontSize: "$3",
  fontWeight: "$bold",
  letterSpacing: "-0.01em",
  color: "$body",
  textDecoration: "none",
});

export const BrandAccent = styled("span", {
  color: "var(--theme-brand)",
});

export const TagPill = styled(Box, {
  fontSize: "$1",
  fontWeight: "$semibold",
  color: "$textMiddle",
  border: "1px solid $bg05",
  borderRadius: "$pill",
  padding: "2px 9px",
  whiteSpace: "nowrap",
});

export const TopSpacer = styled(Box, { marginLeft: "auto" });

export const TopNavLink = styled(NextLink, {
  fontSize: "$2",
  fontWeight: "$medium",
  color: "$textMiddle",
  textDecoration: "none",
  "&:hover": { color: "$body" },
});

export const ThemeToggleButton = styled("button", {
  all: "unset",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 30,
  height: 30,
  borderRadius: "$round",
  color: "$textMiddle",
  border: "1px solid $bg05",
  "&:hover": { color: "$body", backgroundColor: "$bg04" },
  "&:focus-visible": { outline: "2px solid var(--theme-brand)", outlineOffset: 2 },
});

export const MainGrid = styled(Box, {
  flex: 1,
  minHeight: 0,
  display: "grid",
  gridTemplateColumns: "1fr 440px",
  gap: 22,
  padding: "4px 28px 16px",
  alignItems: "stretch",
  "@media (max-width: 880px)": {
    gridTemplateColumns: "1fr",
  },
});

export const Card = styled(Box, {
  backgroundColor: "$bg02",
  border: "1px solid $bg05",
  borderRadius: 14,
  minHeight: 0,
});

export const LeftCard = styled(Card, {
  padding: "$lg 28px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  overflowY: "auto",
});

export const RightCard = styled(Card, {
  padding: "$lg",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 22,
  "@media (max-width: 880px)": {
    order: -1,
  },
});

export const RightPanel = styled(Box, {
  textAlign: "center",
  minHeight: 20,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "$sm",
  width: "100%",
  flexShrink: 0,
  position: "relative",
  zIndex: 1,
  paddingTop: "$xs",
});

export const PizzaWrap = styled(Box, {
  "& svg": {
    maxHeight: "46vh",
    height: "auto",
    width: "auto",
  },
});

export const Footnote = styled(Text, {
  flexShrink: 0,
  fontSize: "11.5px",
  color: "$textTabInactive",
  textAlign: "center",
  padding: "8px 0 12px",
});

export const ResultsActions = styled(Box, {
  display: "flex",
  gap: 10,
  margin: "20px 0 4px",
  flexWrap: "wrap",
  "& button": { width: "auto" },
});

export const SectionLabel = styled(Text, {
  fontSize: "$2",
  fontWeight: "$semibold",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "$textMiddle",
  margin: "0 0 10px",
});

/* ---- Shared primitives -------------------------------------------------- */

export const RiskDot = styled(Box, {
  flexShrink: 0,
  borderRadius: "$round",
  variants: {
    color: {
      green: { backgroundColor: risk.green },
      yellow: { backgroundColor: risk.yellow },
      red: { backgroundColor: risk.red },
      empty: {
        backgroundColor: risk.empty,
        border: `1px solid ${risk.emptyStroke}`,
      },
    },
    size: {
      sm: { width: 9, height: 9 },
      md: { width: 10, height: 10, marginTop: 4 },
      lg: { width: 13, height: 13, marginTop: 3 },
    },
  },
  defaultVariants: { size: "md" },
});

export const Eyebrow = styled(Text, {
  fontSize: "$1",
  fontWeight: "$semibold",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: "var(--theme-brand)",
});

/* ---- Intro -------------------------------------------------------------- */

export const IntroRoot = styled(Box, {
  display: "flex",
  flexDirection: "column",
});

export const IntroTitle = styled("h2", {
  fontSize: 25,
  lineHeight: 1.2,
  letterSpacing: "-0.02em",
  fontWeight: "$bold",
  color: "$body",
  margin: "8px 0 0",
  textWrap: "balance",
});

export const IntroLede = styled(Text, {
  fontSize: "$3",
  lineHeight: 1.55,
  color: "$textMiddle",
  marginTop: "$xs",
});

export const IntroGoal = styled(Box, {
  marginTop: "$md",
  padding: "13px 14px",
  border: "1px solid $bg05",
  borderRadius: "$3",
  backgroundColor: "$bg01",
});

export const IntroGoalText = styled(Text, {
  fontSize: "$2",
  lineHeight: 1.5,
  color: "$textMiddle",
  margin: "0 0 10px",
  "& b": { color: "$body" },
});

export const StartButtonWrap = styled(Box, {
  alignSelf: "flex-start",
  marginTop: "$md",
  "& button": { width: "auto" },
});

/* ---- Stage ladder ------------------------------------------------------- */

export const LadderName = styled(Text, {
  fontSize: "$4",
  fontWeight: "$bold",
  letterSpacing: "-0.01em",
  whiteSpace: "nowrap",
  variants: {
    tone: {
      red: { color: risk.red },
      yellow: { color: risk.yellow },
      green: { color: risk.green },
    },
  },
});

export const LadderKind = styled(Text, {
  fontSize: "9.5px",
  fontWeight: "$bold",
  lineHeight: 1,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "$textMiddle",
  border: "1px solid $bg05",
  borderRadius: "$pill",
  padding: "3px 7px",
  variants: {
    tone: {
      red: { color: risk.red, borderColor: risk.redB },
      yellow: { color: risk.yellow, borderColor: risk.yellowB },
      green: { color: risk.green, borderColor: risk.greenB },
    },
  },
});

export const LadderHere = styled(Text, {
  fontSize: "9.5px",
  fontWeight: "$bold",
  lineHeight: 1,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  padding: "3px 8px",
  borderRadius: "$pill",
  whiteSpace: "nowrap",
  variants: {
    tone: {
      red: { backgroundColor: risk.red, color: "#fff" },
      yellow: { backgroundColor: risk.yellow, color: "#091011" },
      green: { backgroundColor: risk.green, color: "#091011" },
    },
  },
});

export const LadderCheck = styled(Text, {
  marginLeft: "auto",
  fontWeight: "$bold",
  variants: {
    tone: {
      red: { color: risk.red },
      yellow: { color: risk.yellow },
      green: { color: risk.green },
    },
  },
});

export const LadderCell = styled(Box, {
  flex: 1,
  minWidth: 0,
  border: "1px solid $bg05",
  backgroundColor: "$bg02",
  borderRadius: "$3",
  padding: "11px 16px",
  opacity: 0.55,
  transition: "opacity 0.2s, background 0.2s, border-color 0.2s",
  variants: {
    tone: {
      red: {},
      yellow: {},
      green: {},
    },
    passed: { true: { opacity: 0.9 } },
    current: { true: { opacity: 1 } },
    vertical: { true: { opacity: 1, paddingTop: 8, paddingBottom: 8 } },
  },
  compoundVariants: [
    { current: true, tone: "red", css: { backgroundColor: risk.redT, borderColor: risk.redB } },
    { current: true, tone: "yellow", css: { backgroundColor: risk.yellowT, borderColor: risk.yellowB } },
    { current: true, tone: "green", css: { backgroundColor: risk.greenT, borderColor: risk.greenB } },
  ],
});

export const Ladder = styled(Box, {
  display: "flex",
  alignItems: "stretch",
  gap: 0,
  width: "100%",
  variants: {
    vertical: {
      true: { flexDirection: "column", alignItems: "stretch" },
    },
  },
});

export const LadderRow = styled(Box, {
  display: "flex",
  alignItems: "center",
  gap: "$xxs",
});

export const LadderTag = styled(Text, {
  fontSize: "$2",
  fontWeight: "$semibold",
  color: "$textMiddle",
  marginTop: 2,
});

export const LadderArrow = styled(Box, {
  display: "flex",
  alignItems: "center",
  padding: "0 12px",
  color: "$textTabInactive",
  fontSize: "$4",
  variants: {
    vertical: { true: { padding: "2px 0", justifyContent: "center" } },
  },
});

/* ---- Question ----------------------------------------------------------- */

export const QuestionRoot = styled(Box, {});

export const QuestionTop = styled(Box, {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginBottom: 10,
});

export const QuestionCount = styled(Text, {
  fontSize: "$1",
  fontWeight: "$semibold",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "$textMiddle",
  whiteSpace: "nowrap",
});

export const QuestionSlice = styled(Text, {
  fontSize: "$2",
  fontWeight: "$bold",
  color: risk.green,
  whiteSpace: "nowrap",
});

export const QuestionTitle = styled("h3", {
  fontSize: "$5",
  lineHeight: 1.25,
  fontWeight: "$bold",
  letterSpacing: "-0.01em",
  color: "$body",
  margin: 0,
  textWrap: "pretty",
});

export const QuestionHelper = styled(Text, {
  fontSize: "$2",
  lineHeight: 1.5,
  color: "$textMiddle",
  marginTop: 9,
  maxWidth: "60ch",
});

export const OptionList = styled(Box, {
  display: "flex",
  flexDirection: "column",
  gap: "$xxs",
  marginTop: "$md",
});

export const OptionButton = styled("button", {
  all: "unset",
  cursor: "pointer",
  display: "flex",
  alignItems: "flex-start",
  gap: "$xs",
  backgroundColor: "$bg02",
  border: "1px solid $bg05",
  borderRadius: "$3",
  padding: "12px 14px",
  transition: "border-color 0.14s, background 0.14s, transform 0.14s",
  "&:hover": {
    backgroundColor: "$bg03",
    transform: "translateX(2px)",
  },
  variants: {
    selected: { true: { backgroundColor: "$bg03" } },
    color: {
      green: {},
      yellow: {},
      red: {},
    },
  },
  compoundVariants: [
    {
      selected: true,
      color: "green",
      css: {
        borderColor: risk.greenB,
        boxShadow: `0 0 0 1px ${risk.greenB}`,
      },
    },
    {
      selected: true,
      color: "yellow",
      css: {
        borderColor: risk.yellowB,
        boxShadow: `0 0 0 1px ${risk.yellowB}`,
      },
    },
    {
      selected: true,
      color: "red",
      css: {
        borderColor: risk.redB,
        boxShadow: `0 0 0 1px ${risk.redB}`,
      },
    },
  ],
});

export const OptionBody = styled(Box, {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  flex: 1,
});

export const OptionLabel = styled(Text, {
  fontSize: "14.5px",
  fontWeight: "$semibold",
  color: "$body",
  lineHeight: 1.35,
});

export const OptionSub = styled(Text, {
  fontSize: "12.5px",
  color: "$textMiddle",
  lineHeight: 1.45,
});

export const OptionCheck = styled(Text, {
  flexShrink: 0,
  color: "$textMiddle",
  fontWeight: "$bold",
  width: 16,
  textAlign: "center",
  variants: {
    selected: { true: { color: "$body" } },
  },
});

export const QuestionRisk = styled(Box, {
  marginTop: "$md",
  padding: "12px 14px",
  backgroundColor: "$bg02",
  border: "1px solid $bg05",
  borderLeft: "3px solid $bg07",
  borderRadius: "$3",
});

export const QuestionRiskHead = styled(Text, {
  fontSize: "$1",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "$textMiddle",
  fontWeight: 600,
  marginBottom: 6,
});

export const QuestionRiskBody = styled(Text, {
  fontSize: "$2",
  lineHeight: 1.55,
  color: "$textLight",
});

export const QuestionRefs = styled(Box, {
  marginTop: 10,
  display: "flex",
  flexWrap: "wrap",
  gap: "$xs",
});

export const QuestionRefLink = styled("a", {
  fontSize: "$1",
  color: "$textMiddle",
  textDecoration: "underline",
  textDecorationStyle: "dotted",
  textUnderlineOffset: "2px",
  "&:hover": { color: "$textLight" },
});

export const BackButton = styled("button", {
  all: "unset",
  cursor: "pointer",
  marginTop: "$xs",
  fontSize: "$2",
  fontWeight: "$semibold",
  color: "$textMiddle",
  "&:hover": { color: "$body" },
});

/* ---- Blockers / legend -------------------------------------------------- */

export const BlockText = styled(Text, {
  fontSize: "$3",
  lineHeight: 1.5,
  color: "$textMiddle",
  margin: 0,
  "& b": { color: "$body" },
  variants: {
    win: { true: { color: risk.green, fontWeight: "$semibold" } },
    hint: { true: { color: "$textMiddle", fontStyle: "italic" } },
  },
});

export const BlockNames = styled("span", {
  color: "$body",
  fontWeight: "$semibold",
});

export const LegendRow = styled(Box, {
  display: "flex",
  gap: "$md",
  flexWrap: "wrap",
  justifyContent: "center",
  fontSize: "$2",
  color: "$textMiddle",
});

export const LegendItem = styled(Box, {
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
});

/* ---- Results hero ------------------------------------------------------- */

export const HeroCard = styled(Box, {
  border: "1px solid $bg05",
  borderRadius: "$4",
  padding: "18px 20px",
  marginBottom: 20,
  variants: {
    tone: {
      red: { backgroundColor: risk.redT, borderColor: risk.redB },
      yellow: { backgroundColor: risk.yellowT, borderColor: risk.yellowB },
      green: { backgroundColor: risk.greenT, borderColor: risk.greenB },
    },
  },
});

export const HeroEyebrow = styled(Text, {
  fontSize: "$1",
  fontWeight: "$semibold",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "$textMiddle",
});

export const HeroStageLine = styled(Box, {
  display: "flex",
  alignItems: "center",
  gap: 11,
  marginTop: 7,
});

export const HeroStageNum = styled(Text, {
  fontSize: 30,
  fontWeight: "$bold",
  letterSpacing: "-0.02em",
  lineHeight: 1,
});

export const HeroStageKind = styled(Text, {
  fontSize: "$1",
  fontWeight: "$bold",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  border: "1px solid",
  borderRadius: "$pill",
  padding: "3px 11px",
});

export const HeroProgress = styled(Text, {
  fontSize: "12.5px",
  fontWeight: "$bold",
  color: "$body",
  marginTop: 9,
});

export const HeroLine = styled(Text, {
  fontSize: "$3",
  lineHeight: 1.5,
  color: "$body",
  marginTop: "$xs",
  textWrap: "pretty",
});

/* ---- Level up ----------------------------------------------------------- */

export const LevelRoot = styled(Box, {});

export const LevelSection = styled(Box, { marginBottom: 22 });

export const WonHead = styled(Box, {
  display: "flex",
  alignItems: "center",
  gap: "$xxs",
  fontSize: "$2",
  fontWeight: "$bold",
  color: risk.green,
  margin: "0 0 12px",
});

export const LevelHead = styled(Text, {
  fontSize: "$2",
  fontWeight: "$semibold",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "$textMiddle",
  margin: "0 0 12px",
});

export const ItemList = styled(Box, {
  display: "flex",
  flexDirection: "column",
  gap: 9,
});

export const WinCard = styled(Box, {
  display: "flex",
  gap: "$xs",
  backgroundColor: risk.greenT,
  border: `1px solid ${risk.greenB}`,
  borderRadius: "$3",
  padding: "13px 15px",
  marginBottom: 9,
});

export const WinTrophy = styled(Box, {
  flexShrink: 0,
  width: 26,
  height: 26,
  borderRadius: "$round",
  backgroundColor: risk.green,
  color: "var(--on-accent)",
  fontSize: "$3",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const WinBody = styled(Box, {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
});

export const WinHead = styled(Box, {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
  width: "100%",
});

export const WinSlice = styled(Text, {
  fontSize: "$3",
  fontWeight: "$bold",
  color: "$body",
  flex: 1,
  minWidth: 0,
});

export const WinBadge = styled(Text, {
  fontSize: "10px",
  fontWeight: "$bold",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: risk.green,
  whiteSpace: "nowrap",
  flexShrink: 0,
});

export const WinWhy = styled(Text, {
  fontSize: "$2",
  lineHeight: 1.5,
  color: "$textMiddle",
  marginTop: 5,
});

export const UpCard = styled(Box, {
  display: "flex",
  gap: "$xs",
  backgroundColor: "$bg03",
  border: "1px solid $bg05",
  borderRadius: "$3",
  padding: "13px 15px",
  variants: {
    color: {
      red: { borderLeft: `3px solid ${risk.red}` },
      yellow: { borderLeft: `3px solid ${risk.yellow}` },
    },
  },
});

export const UpBody = styled(Box, {
  flex: 1,
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
});

export const UpHead = styled(Box, {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 10,
});

export const UpSlice = styled(Text, {
  fontSize: "$3",
  fontWeight: "$bold",
  color: "$body",
});

export const UpFlag = styled(Text, {
  fontSize: "10px",
  fontWeight: "$bold",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
  flexShrink: 0,
  variants: {
    color: {
      red: { color: risk.red },
      yellow: { color: risk.yellow },
    },
  },
});

export const UpTip = styled(Text, {
  fontSize: "$2",
  lineHeight: 1.5,
  color: "$textMiddle",
  marginTop: 5,
});

/* ---- Slice summary ------------------------------------------------------ */

/* ---- Share card / modal ------------------------------------------------- */

export const ShareCardRoot = styled(Box, {
  width: 520,
  maxWidth: "100%",
  backgroundColor: "$bg01",
  border: "1px solid $bg05",
  borderRadius: "$4",
  overflow: "hidden",
  backgroundImage:
    "radial-gradient(120% 90% at 100% 0%, var(--obol-green-tint), transparent 60%)",
});

export const ShareTop = styled(Box, {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "16px 20px",
  borderBottom: "1px solid $bg05",
});

export const ShareBrand = styled(Text, {
  fontSize: "$3",
  fontWeight: "$bold",
  letterSpacing: "-0.01em",
  color: "$body",
});

export const ShareUrl = styled(Text, {
  fontFamily: "$mono",
  fontSize: "$1",
  color: "$textMiddle",
});

export const ShareBody = styled(Box, {
  display: "flex",
  flexWrap: "nowrap",
  alignItems: "center",
  gap: "$md",
  padding: 20,
});

export const ShareMeta = styled(Box, {
  flex: 1,
  minWidth: 210,
  flexShrink: 0,
});

export const ShareResk = styled(Text, {
  fontSize: "$2",
  fontWeight: "$semibold",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "$textMiddle",
});

export const ShareStage = styled(Text, {
  fontSize: 40,
  fontWeight: "$bold",
  letterSpacing: "-0.02em",
  lineHeight: 1,
  marginTop: 6,
});

export const ShareKind = styled(Text, {
  display: "inline-block",
  fontSize: "$1",
  fontWeight: "$bold",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  border: "1px solid",
  borderRadius: "$pill",
  padding: "3px 11px",
  marginTop: 9,
  whiteSpace: "nowrap",
});

export const ShareLine = styled(Text, {
  fontSize: "12.5px",
  lineHeight: 1.45,
  color: "$textMiddle",
  marginTop: 11,
});

export const ShareFoot = styled(Box, {
  padding: "13px 20px",
  borderTop: "1px solid $bg05",
  fontSize: "$2",
  fontWeight: "$semibold",
  color: "var(--theme-brand)",
  backgroundColor: "$bg02",
});

export const NameField = styled("label", {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  marginBottom: 14,
});

export const NameLabel = styled(Text, {
  fontSize: "$1",
  fontWeight: "$semibold",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "$textMiddle",
});

export const NameError = styled(Text, {
  fontSize: "$1",
  color: risk.red,
  marginTop: 4,
});

export const CopyLinkButton = styled(Box, {
  width: 148,
  flexShrink: 0,
  "& button": {
    width: "100%",
    minWidth: "unset",
    justifyContent: "center",
    whiteSpace: "nowrap",
  },
});

export const NameInput = styled("input", {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "$sans",
  fontSize: "$3",
  fontWeight: "$medium",
  color: "$body",
  backgroundColor: "$bg02",
  border: "1px solid $bg05",
  borderRadius: "$3",
  padding: "10px 12px",
  "&:focus": {
    outline: "none",
    boxShadow: "0 0 0 2px var(--theme-brand)",
  },
});

export const ModalOverlay = styled(Box, {
  position: "fixed",
  inset: 0,
  zIndex: 100,
  backgroundColor: "rgba(5, 10, 11, 0.78)",
  backdropFilter: "blur(4px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "$lg",
});

export const ModalInner = styled(Box, {
  width: 560,
  maxWidth: "100%",
  backgroundColor: "$bg02",
  border: "1px solid $bg05",
  borderRadius: 14,
  padding: 22,
  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
});

export const ModalHead = styled(Box, {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "$md",
});

export const ModalTitle = styled(Text, {
  fontSize: "$4",
  fontWeight: "$bold",
  color: "$body",
});

export const ModalClose = styled("button", {
  all: "unset",
  cursor: "pointer",
  color: "$textMiddle",
  fontSize: "$3",
  padding: "4px 8px",
  borderRadius: "$2",
  "&:hover": {
    color: "$body",
    backgroundColor: "$bg04",
  },
});

export const ModalActions = styled(Box, {
  display: "flex",
  gap: 10,
  marginTop: 18,
  flexWrap: "wrap",
});

export const ModalNote = styled(Text, {
  fontSize: "$2",
  lineHeight: 1.5,
  color: "$textMiddle",
  marginTop: 14,
  "& b": {
    color: "$body",
    fontFamily: "$mono",
    fontWeight: "$semibold",
  },
});
