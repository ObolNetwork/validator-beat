import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Pizza } from "@components/pizza/Pizza";
import { VbButton } from "@components/ui/VbButton";
import { DOWNTIME_CALCULATOR_URL } from "@constants/index";
import { badgeSvg } from "@lib/share/badge-svg";
import { copyText } from "@lib/share/clipboard";
import { downloadElementAsPng } from "@lib/share/download-image";
import { SHARE_NAME_MAX, badgeUrl } from "@lib/share/share-url";
import { SLICES, STAGE_META, blockers, getTip, shareCode, sliceTarget } from "@lib/rubric";
import type { Answers, SliceColor, SliceId, Stage } from "@lib/rubric/types";
import type { SliceMeta } from "@lib/rubric/types";
import {
  BrandAccent,
  HeroCard,
  EmbedActions,
  EmbedBox,
  EmbedHead,
  HeroEyebrow,
  HeroLine,
  HeroOwner,
  HeroProgress,
  HeroStageKind,
  HeroStageLine,
  HeroStageNum,
  ItemList,
  LevelHead,
  LevelRoot,
  LevelSection,
  CopyLinkButton,
  ModalActions,
  ModalClose,
  NameError,
  ModalHead,
  ModalInner,
  ModalNote,
  ModalOverlay,
  ModalTitle,
  NameField,
  NameInput,
  NameLabel,
  RiskDot,
  ShareBody,
  ShareBrand,
  ShareCardRoot,
  ShareFoot,
  ShareKind,
  ShareLine,
  ShareMeta,
  ShareMore,
  ShareMoreLink,
  ShareOwner,
  ShareResk,
  ShareStage,
  ShareTop,
  ShareUrl,
  UpBody,
  UpCard,
  UpFlag,
  UpHead,
  UpSlice,
  UpTip,
  WinBadge,
  WinBody,
  WinCard,
  WinHead,
  WinSlice,
  WinTrophy,
  WinWhy,
  WonHead,
  risk,
} from "./stitches";

/** Longer result-hero copy per stage; naming comes from STAGE_META. */
const STAGE_LINE: Record<Stage, string> = {
  0: "Every operator starts here. Clear the items in red below to reach Stage 1 — where no single failure can expose you to slashing.",
  1: "No single failure can expose you to slashing. One more climb to Stage 2 — where no single point of failure can take you offline either.",
  2: "No single point of failure — no single compromise can slash you, and no single outage can stop you. You're upholding Ethereum's core values: decentralization, credible neutrality, and censorship resistance.",
};

const WHY_MAXED: Record<SliceId, string> = {
  keyCustody: "No single compromise can sign with your stake.",
  clientDiversity: "No supermajority-client fork can drag you in.",
  infraDiversity: "No single provider can take your validator offline.",
  osDiversity: "No single OS compromise can reach enough key shares to sign.",
  cpuDiversity: "No single CPU-level flaw can reach enough key shares to sign.",
  geoDiversity: "No single region's outage can take your validator offline.",
};

type ResultHeroProps = {
  stage: Stage;
  answers: Answers;
  ownerName?: string;
  /** Viewing someone else's shared link rather than your own fresh result. */
  guest?: boolean;
};

export function ResultHero({ stage, answers, ownerName, guest = false }: ResultHeroProps) {
  const m = STAGE_META[stage];
  const tone = risk[m.tone];
  const name = ownerName?.trim();
  const greens = SLICES.filter((s) => answers[s.id] === "green").length;
  const toGo = blockers(answers).length;
  const progress =
    stage === 2
      ? "All six slices maxed out"
      : `${greens} of 6 maxed · ${toGo} to go for Stage ${stage + 1}`;

  return (
    <HeroCard tone={m.tone}>
      <HeroEyebrow>{guest ? "Shared result" : name ? "Result for" : "Your result"}</HeroEyebrow>
      {name && <HeroOwner>{name}</HeroOwner>}
      <HeroStageLine>
        <HeroStageNum css={{ color: tone }}>{m.name}</HeroStageNum>
        <HeroStageKind css={{ color: tone, borderColor: tone }}>{m.kind}</HeroStageKind>
      </HeroStageLine>
      <HeroProgress>{progress}</HeroProgress>
      <HeroLine>{guest ? m.tagline + "." : STAGE_LINE[stage]}</HeroLine>
    </HeroCard>
  );
}

type LevelUpProps = { answers: Answers; stage: Stage; guest?: boolean };

const FLAG: Record<1 | 2, { fix: string; check: string }> = {
  1: { fix: "Next → Stage 1", check: "Find out → Stage 1" },
  2: { fix: "Go for green → Stage 2", check: "Find out → Stage 2" },
};

export function LevelUp({ answers, stage, guest = false }: LevelUpProps) {
  const greens = SLICES.filter((s) => answers[s.id] === "green");
  // Stage 1 blockers first, then everything standing between you and Stage 2.
  const open = SLICES.map((s) => ({ slice: s, color: answers[s.id]!, target: sliceTarget(s, answers[s.id]) }))
    .filter((x): x is { slice: SliceMeta; color: SliceColor; target: 1 | 2 } => x.target != null)
    .sort((x, y) => x.target - y.target);
  const livenessOpen = open.some((x) => x.slice.kind === "liveness");

  const Win = ({ slice }: { slice: SliceMeta }) => (
    <WinCard>
      <WinTrophy>★</WinTrophy>
      <WinBody>
        <WinHead>
          <WinSlice>{slice.label}</WinSlice>
          <WinBadge>Maxed · top tier</WinBadge>
        </WinHead>
        <WinWhy>{WHY_MAXED[slice.id]}</WinWhy>
      </WinBody>
    </WinCard>
  );

  const Next = ({ slice, color, target }: { slice: SliceMeta; color: SliceColor; target: 1 | 2 }) => (
    <UpCard color={color === "green" ? undefined : color}>
      <RiskDot color={color} size="md" />
      <UpBody>
        <UpHead>
          <UpSlice>{slice.label}</UpSlice>
          <UpFlag color={color === "green" ? undefined : color}>
            {color === "unknown" ? FLAG[target].check : FLAG[target].fix}
          </UpFlag>
        </UpHead>
        <UpTip>{getTip(slice.id, color)}</UpTip>
      </UpBody>
    </UpCard>
  );

  return (
    <LevelRoot>
      {greens.length > 0 && (
        <LevelSection>
          <WonHead>
            <span>★</span>
            {stage === 2
              ? guest
                ? "All six maxed — perfect score"
                : "You maxed out all six — perfect score"
              : `${guest ? "Maxed" : "You've maxed"} ${greens.length} of 6 — top tier`}
          </WonHead>
          <ItemList>
            {greens.map((s) => (
              <Win key={s.id} slice={s} />
            ))}
          </ItemList>
        </LevelSection>
      )}
      {open.length > 0 && (
        <LevelSection>
          <LevelHead>
            {greens.length > 0 ? "Keep climbing — next wins" : "Next wins"}
          </LevelHead>
          <ItemList>
            {open.map((x) => (
              <Next key={x.slice.id} {...x} />
            ))}
          </ItemList>
          {livenessOpen && (
            <UpTip css={{ marginTop: 12 }}>
              Downtime may soon cost more than it does today:{" "}
              <a href="https://eips.ethereum.org/EIPS/eip-7716" target="_blank" rel="noopener noreferrer">
                EIP-7716
              </a>{" "}
              would scale missed-attestation penalties with how many validators fail together —
              roughly 78× today&apos;s rate when 10% of the network is down.{" "}
              <a href={DOWNTIME_CALCULATOR_URL} target="_blank" rel="noopener noreferrer">
                Estimate your exposure ↗
              </a>
            </UpTip>
          )}
        </LevelSection>
      )}
    </LevelRoot>
  );
}

type ShareCardProps = {
  answers: Answers;
  stage: Stage;
  shareUrl: string;
  ownerName?: string;
};

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ answers, stage, shareUrl, ownerName }, ref) {
    const m = STAGE_META[stage];
    const name = ownerName?.trim();
    const tone = risk[m.tone];
    return (
      <ShareCardRoot ref={ref}>
        <ShareTop>
          <ShareBrand>
            Validator <BrandAccent>Beat</BrandAccent>
          </ShareBrand>
          <ShareUrl>{shareUrl.replace(/^https?:\/\//, "").replace(/\?.*$/, "")}</ShareUrl>
        </ShareTop>
        <ShareBody>
          <Pizza
            answers={answers}
            size={210}
            active={null}
            stage={stage}
            showLabels
            labelScale={0.72}
          />
          <ShareMeta>
            {name ? (
              <>
                <ShareOwner>{name}</ShareOwner>
                <ShareResk>is</ShareResk>
              </>
            ) : (
              <ShareResk>My validator setup is</ShareResk>
            )}
            <ShareStage css={{ color: tone }}>{m.name}</ShareStage>
            <ShareKind css={{ color: tone, borderColor: tone }}>{m.kind}</ShareKind>
            <ShareLine>{m.shareLine}</ShareLine>
          </ShareMeta>
        </ShareBody>
        <ShareFoot>How resilient is your validator? Find out →</ShareFoot>
      </ShareCardRoot>
    );
  },
);

type ShareModalProps = {
  answers: Answers;
  stage: Stage;
  shareUrl: string;
  ownerName: string;
  onOwnerNameChange: (name: string) => void;
  /** Set when this result was taken against someone else's; the link then carries both. */
  compareLine?: string;
  onClose: () => void;
};

type CopyState = "idle" | "copied" | "failed";

function useCopy() {
  const [state, setState] = useState<{ key: string; status: CopyState }>({ key: "", status: "idle" });
  const copy = async (key: string, text: string) => {
    const ok = await copyText(text);
    setState({ key, status: ok ? "copied" : "failed" });
    setTimeout(() => setState({ key: "", status: "idle" }), 1800);
  };
  const label = (key: string, idle: string) =>
    state.key !== key ? idle : state.status === "copied" ? "Copied ✓" : state.status === "failed" ? "Copy failed" : idle;
  return { copy, label };
}

export function ShareModal({
  answers,
  stage,
  shareUrl,
  ownerName,
  onOwnerNameChange,
  compareLine,
  onClose,
}: ShareModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const code = shareCode(answers);
  const { copy, label } = useCopy();

  const who = ownerName.trim();
  const stageName = STAGE_META[stage].name;
  const shareText = compareLine
    ? `${compareLine} How resilient is yours?`
    : who
      ? `${who} is ${stageName} on Validator Beat. How resilient is yours?`
      : `My validator setup is ${stageName} on Validator Beat. How resilient is yours?`;
  const badgeAlt = `Validator Beat: ${stageName}`;
  const badgeMarkdown = `[![${badgeAlt}](${badgeUrl(code)})](${shareUrl})`;
  const badgeHtml = `<a href="${shareUrl}"><img src="${badgeUrl(code)}" alt="${badgeAlt}" height="20"></a>`;

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const handleNameChange = (value: string) => {
    if (value.length > SHARE_NAME_MAX) {
      setNameError(true);
      return;
    }
    setNameError(false);
    onOwnerNameChange(value);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const openIntent = (url: string) => window.open(url, "_blank", "noopener,noreferrer");
  const text = encodeURIComponent(shareText);
  const url = encodeURIComponent(shareUrl);

  const nativeShare = () => {
    navigator.share({ title: "Validator Beat", text: shareText, url: shareUrl }).catch(() => {});
  };

  const downloadImage = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      await downloadElementAsPng(
        cardRef.current,
        `validator-beat-${code.toLowerCase()}.png`,
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose} role="presentation">
      <ModalInner
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
      >
        <ModalHead>
          <ModalTitle id="share-title">Share this result</ModalTitle>
          <ModalClose type="button" onClick={onClose} aria-label="Close">
            ✕
          </ModalClose>
        </ModalHead>
        <NameField>
          <NameLabel>Name this setup (optional, shown on the page)</NameLabel>
          <NameInput
            type="text"
            value={ownerName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleNameChange(e.target.value)
            }
            placeholder="e.g. Ethereum Foundation's cluster"
            maxLength={SHARE_NAME_MAX}
            aria-invalid={nameError}
            css={nameError ? { borderColor: risk.red } : undefined}
          />
          {nameError && (
            <NameError>Maximum {SHARE_NAME_MAX} characters</NameError>
          )}
        </NameField>
        <ShareCard
          ref={cardRef}
          answers={answers}
          stage={stage}
          shareUrl={shareUrl}
          ownerName={ownerName}
        />
        <ModalActions>
          {canNativeShare && <VbButton onClick={nativeShare}>Share…</VbButton>}
          <VbButton
            variant={canNativeShare ? "secondary" : undefined}
            onClick={() => openIntent(`https://x.com/intent/post?text=${text}&url=${url}`)}
          >
            Post to X →
          </VbButton>
          <CopyLinkButton>
            <VbButton variant="secondary" onClick={() => copy("link", shareUrl)}>
              {label("link", "Copy link")}
            </VbButton>
          </CopyLinkButton>
          <VbButton variant="secondary" onClick={downloadImage} disabled={downloading}>
            {downloading ? "Preparing…" : "Download image"}
          </VbButton>
        </ModalActions>
        <ShareMore>
          <span>Also on</span>
          <ShareMoreLink
            as="button"
            type="button"
            onClick={() => openIntent(`https://farcaster.xyz/~/compose?text=${text}&embeds[]=${url}`)}
          >
            Farcaster
          </ShareMoreLink>
          <ShareMoreLink
            as="button"
            type="button"
            onClick={() => openIntent(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`)}
          >
            LinkedIn
          </ShareMoreLink>
          <ShareMoreLink
            as="button"
            type="button"
            onClick={() => openIntent(`https://t.me/share/url?url=${url}&text=${text}`)}
          >
            Telegram
          </ShareMoreLink>
        </ShareMore>
        <EmbedBox>
          <EmbedHead>
            <NameLabel>Badge for your docs, README, or site</NameLabel>
            <span
              aria-hidden="true"
              // Rendered from the same source as the pre-built /badge/*.svg files.
              dangerouslySetInnerHTML={{ __html: badgeSvg(answers) }}
            />
          </EmbedHead>
          <EmbedActions>
            <VbButton variant="secondary" onClick={() => copy("md", badgeMarkdown)}>
              {label("md", "Copy Markdown")}
            </VbButton>
            <VbButton variant="secondary" onClick={() => copy("html", badgeHtml)}>
              {label("html", "Copy HTML")}
            </VbButton>
          </EmbedActions>
        </EmbedBox>
        <ModalNote>
          The link encodes your six answers (<b>{code}</b>)
          {compareLine ? " plus the result you compared against" : ""} — anyone who opens it
          sees this exact result. Nothing is stored.
        </ModalNote>
      </ModalInner>
    </ModalOverlay>
  );
}
