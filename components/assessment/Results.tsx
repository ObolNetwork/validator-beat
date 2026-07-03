import React, { forwardRef, useEffect, useRef, useState } from "react";
import { Pizza } from "@components/pizza/Pizza";
import { VbButton } from "@components/ui/VbButton";
import { SHARE_NAME_MAX } from "@constants/index";
import { downloadElementAsPng } from "@lib/share/download-image";
import { SLICES, STAGE_META, getTip, shareCode } from "@lib/rubric";
import type { Answers, SliceColor, SliceId, Stage } from "@lib/rubric/types";
import type { SliceMeta } from "@lib/rubric/types";
import {
  BrandAccent,
  HeroCard,
  HeroEyebrow,
  HeroLine,
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
  osDiversity: "No single OS compromise can reach all of your keys.",
  cpuDiversity: "No single CPU-level flaw can reach all of your keys.",
  geoDiversity: "No single region's outage can take your validator offline.",
};

const SHARE_LINE: Record<Stage, string> = {
  0: "Has a single point of failure — for now.",
  1: "Safe from slashing — no single failure can get it slashed.",
  2: "Maximum resilience — no single failure can slash it or stop it.",
};

type ResultHeroProps = { stage: Stage; answers: Answers; ownerName?: string };

export function ResultHero({ stage, answers, ownerName }: ResultHeroProps) {
  const m = STAGE_META[stage];
  const tone = risk[m.tone];
  const greens = SLICES.filter((s) => answers[s.id] === "green").length;
  const outOfRed = SLICES.filter((s) => answers[s.id] && answers[s.id] !== "red").length;
  const progress =
    stage === 2
      ? "All six slices maxed out"
      : `${outOfRed} of 6 slices secured · ${greens} maxed`;

  return (
    <HeroCard tone={m.tone}>
      <HeroEyebrow>
        {ownerName?.trim() ? `${ownerName.trim()}'s result` : "Your result"}
      </HeroEyebrow>
      <HeroStageLine>
        <HeroStageNum css={{ color: tone }}>{m.name}</HeroStageNum>
        <HeroStageKind css={{ color: tone, borderColor: tone }}>{m.kind}</HeroStageKind>
      </HeroStageLine>
      <HeroProgress>{progress}</HeroProgress>
      <HeroLine>{STAGE_LINE[stage]}</HeroLine>
    </HeroCard>
  );
}

type LevelUpProps = { answers: Answers; stage: Stage };

export function LevelUp({ answers, stage }: LevelUpProps) {
  const greens = SLICES.filter((s) => answers[s.id] === "green");
  const reds = SLICES.filter((s) => answers[s.id] === "red");
  const yellows = SLICES.filter((s) => answers[s.id] === "yellow");

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

  const Next = ({ slice, color }: { slice: SliceMeta; color: SliceColor }) => (
    <UpCard color={color}>
      <RiskDot color={color} size="md" />
      <UpBody>
        <UpHead>
          <UpSlice>{slice.label}</UpSlice>
          <UpFlag color={color}>
            {color === "red" ? "Next → Stage 1" : "Go for green → Stage 2"}
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
              ? "You maxed out all six — perfect score"
              : `You've maxed ${greens.length} of 6 — top tier`}
          </WonHead>
          <ItemList>
            {greens.map((s) => (
              <Win key={s.id} slice={s} />
            ))}
          </ItemList>
        </LevelSection>
      )}
      {reds.length + yellows.length > 0 && (
        <LevelSection>
          <LevelHead>
            {greens.length > 0 ? "Keep climbing — your next wins" : "Your next wins"}
          </LevelHead>
          <ItemList>
            {reds.map((s) => (
              <Next key={s.id} slice={s} color="red" />
            ))}
            {yellows.map((s) => (
              <Next key={s.id} slice={s} color="yellow" />
            ))}
          </ItemList>
        </LevelSection>
      )}
    </LevelRoot>
  );
}

type ShareCardProps = {
  answers: Answers;
  stage: Stage;
  shareUrl: string;
};

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ answers, stage, shareUrl }, ref) {
    const m = STAGE_META[stage];
    const tone = risk[m.tone];
    return (
      <ShareCardRoot ref={ref}>
        <ShareTop>
          <ShareBrand>
            Validator <BrandAccent>Beat</BrandAccent>
          </ShareBrand>
          <ShareUrl>{shareUrl.replace(/^https?:\/\//, "")}</ShareUrl>
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
            <ShareResk>My validator setup is</ShareResk>
            <ShareStage css={{ color: tone }}>{m.name}</ShareStage>
            <ShareKind css={{ color: tone, borderColor: tone }}>{m.kind}</ShareKind>
            <ShareLine>{SHARE_LINE[stage]}</ShareLine>
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
  onClose: () => void;
};

export function ShareModal({
  answers,
  stage,
  shareUrl,
  ownerName,
  onOwnerNameChange,
  onClose,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [nameError, setNameError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const code = shareCode(answers);

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

  const copy = () => {
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const postToX = () => {
    const who = ownerName.trim();
    const line = who
      ? `${who}'s validator setup is ${STAGE_META[stage].name} on Validator Beat. How resilient is yours?`
      : `My validator setup is ${STAGE_META[stage].name} on Validator Beat. How resilient is yours?`;
    const text = encodeURIComponent(line);
    window.open(
      `https://x.com/intent/post?text=${text}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer",
    );
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
        aria-labelledby="share-title"
      >
        <ModalHead>
          <ModalTitle id="share-title">Share your result</ModalTitle>
          <ModalClose type="button" onClick={onClose} aria-label="Close">
            ✕
          </ModalClose>
        </ModalHead>
        <NameField>
          <NameLabel>Your name (optional, in URL only)</NameLabel>
          <NameInput
            type="text"
            value={ownerName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleNameChange(e.target.value)
            }
            placeholder="e.g. Kody's Cluster"
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
        />
        <ModalActions>
          <VbButton onClick={postToX}>Post to X →</VbButton>
          <CopyLinkButton>
            <VbButton variant="secondary" onClick={copy}>
              {copied ? "Copied ✓" : "Copy link"}
            </VbButton>
          </CopyLinkButton>
          <VbButton variant="secondary" onClick={downloadImage} disabled={downloading}>
            {downloading ? "Preparing…" : "Download image"}
          </VbButton>
        </ModalActions>
        <ModalNote>
          The link encodes your six colors (<b>{code}</b>) — anyone who opens it sees
          this exact result. Nothing is stored.
        </ModalNote>
      </ModalInner>
    </ModalOverlay>
  );
}
