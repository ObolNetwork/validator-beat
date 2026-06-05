import { VbButton } from "@components/ui/VbButton";
import { StageLadder } from "./StageLadder";
import {
  Eyebrow,
  IntroGoal,
  IntroGoalText,
  IntroLede,
  IntroRoot,
  IntroTitle,
  StartButtonWrap,
  risk,
} from "./stitches";

type IntroProps = {
  onStart: () => void;
};

export function Intro({ onStart }: IntroProps) {
  return (
    <IntroRoot>
      <Eyebrow>A neutral resource for validator fault tolerance</Eyebrow>
      <IntroTitle>How resilient is your validator setup?</IntroTitle>
      <IntroLede>
        Six quick questions about how you run. Each one checks for a single point of failure —
        any party, client, provider, machine, or place that, if it broke or turned hostile, could
        get you
        <span style={{ color: risk.red, fontWeight: 600 }}> slashed</span>, knocked
        <span style={{ color: risk.yellow, fontWeight: 600 }}> offline</span>, or
        <span style={{ color: risk.red, fontWeight: 600 }}> censored</span>. Your answers fill the
        pizza and set your Stage. About a minute · nothing is submitted or stored.
      </IntroLede>
      <IntroGoal>
        <IntroGoalText>
          All six <b>green</b> = no single point of failure — upholding Ethereum&apos;s core
          values: <b>decentralization</b>, <b>credible neutrality</b>, and{" "}
          <b>censorship resistance</b>.
        </IntroGoalText>
        <StageLadder stage={null} vertical />
      </IntroGoal>
      <StartButtonWrap>
        <VbButton onClick={onStart}>Start the assessment →</VbButton>
      </StartButtonWrap>
    </IntroRoot>
  );
}
