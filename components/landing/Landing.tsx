import Link from "next/link";
import { Pizza } from "@components/pizza/Pizza";
import { ThemeToggle } from "@components/assessment/ThemeToggle";
import type { Answers, SliceId } from "@lib/rubric/types";

/**
 * Marketing landing page — the public entry point in front of the assessment.
 * Ported from the approved design handoff (light/cream, ecosystem-neutral).
 * Scoped under .vb-landing; reuses the shared Pizza component, which reads the
 * cream-tuned CSS tokens defined in styles/landing.css.
 */

const ASSESS = "/assess/";
const METHODOLOGY = "/methodology/";
const VALOS = "https://lidofinance.github.io/valos/valos-spec.html";

/* muted signal hexes for the static slice dots (match the cream tokens) */
const FUNC = { green: "#3a9e80", yellow: "#cf9a3a", red: "#c46044" } as const;

/* ---- tiny line-icon set (single-color, currentColor) --------------------- */
type IconProps = { size?: number; sw?: number; children?: React.ReactNode };
const Icon = ({ size = 22, sw = 1.8, children }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);
const IArrowR = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </Icon>
);
const IArrowD = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14" />
    <path d="M6 13l6 6 6-6" />
  </Icon>
);
const IExt = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4l-9 9" />
    <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
  </Icon>
);
const ISlash = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3l8 3.5v5c0 4.6-3.2 7.9-8 9.5-4.8-1.6-8-4.9-8-9.5v-5L12 3z" />
    <path d="M9.5 9.5l5 5" />
    <path d="M14.5 9.5l-5 5" />
  </Icon>
);
const IPulse = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 12h4l2.5-6 4 13 2.5-7H21" />
  </Icon>
);

const Mark = () => (
  <svg className="l-brand__mark" viewBox="0 0 24 24" aria-hidden="true">
    <g transform="translate(12 12)">
      <path d="M0 0 L0 -11 A11 11 0 0 1 9.5 -5.5 Z" fill="#2fe4ab" />
      <path d="M0 0 L9.5 -5.5 A11 11 0 0 1 9.5 5.5 Z" fill="#e8b339" />
      <path d="M0 0 L9.5 5.5 A11 11 0 0 1 0 11 Z" fill="#2fe4ab" />
      <path d="M0 0 L0 11 A11 11 0 0 1 -9.5 5.5 Z" fill="#dd603c" />
      <path d="M0 0 L-9.5 5.5 A11 11 0 0 1 -9.5 -5.5 Z" fill="#2fe4ab" />
      <path d="M0 0 L-9.5 -5.5 A11 11 0 0 1 0 -11 Z" fill="#e8b339" />
      <circle r="4" fill="#fffefa" stroke="#d2cbb8" strokeWidth="1" />
    </g>
  </svg>
);

/* ---- §0 Nav --------------------------------------------------------------- */
const LNav = () => (
  <nav className="l-nav">
    <div className="l-nav__in">
      <a className="l-brand" href="#top">
        <Mark /> Validator <span className="l-brand__beat">Beat</span>
      </a>
      <span className="l-nav__spacer" />
      <div className="l-nav__links">
        <a className="l-nav__link" href="#how">
          How it works
        </a>
        <Link className="l-nav__link" href={METHODOLOGY}>
          Methodology
        </Link>
        <a className="l-nav__link" href={VALOS} target="_blank" rel="noopener noreferrer">
          valOS
        </a>
      </div>
      <span className="l-nav__toggle">
        <ThemeToggle />
      </span>
      <Link className="lbtn lbtn--primary" href={ASSESS}>
        Assess your validator <IArrowR size={16} />
      </Link>
    </div>
  </nav>
);

/* ---- §1 Hero -------------------------------------------------------------- */
const HERO_SAMPLE: Answers = {
  keyCustody: "green",
  clientDiversity: "green",
  infraDiversity: "yellow",
  osDiversity: "green",
  cpuDiversity: "red",
  geoDiversity: "yellow",
};
const LHero = () => (
  <header className="l-hero" id="top">
    <div className="l-wrap">
      <div className="l-hero__grid">
        <div>
          <p className="l-eyebrow">A simple view into validator operations</p>
          <h1 className="l-h1">
            The validator ecosystem is missing its{" "}
            <span className="l-beat">
              beat<span className="l-beat__pulse" aria-hidden="true" />
            </span>
            .
          </h1>
          <p className="l-lede">
            When you stake ETH, you always (sometimes unknowingly) pick an operator. You{" "}
            <strong>cannot</strong> see how they hold their keys, which clients they run, or how
            correlated their setup is with everyone else securing the network. Validator Beat makes
            that visible.
          </p>
          <div className="l-ctarow">
            <Link className="lbtn lbtn--primary lbtn--lg" href={ASSESS}>
              Assess your validator <IArrowR size={17} />
            </Link>
            <a className="l-scroll" href="#how">
              See how it works <IArrowD size={16} />
            </a>
          </div>
        </div>
        <div className="l-hero__pizzawrap">
          <div className="l-hero__glow" />
          <div className="l-hero__pizza">
            <Pizza answers={HERO_SAMPLE} size={360} showCenter={false} glowOpacity={0.26} />
          </div>
          <span className="l-hero__cap">
            <b>An example operator profile</b>
          </span>
        </div>
      </div>
    </div>
  </header>
);

/* ---- §2 The gap ----------------------------------------------------------- */
const LGap = () => (
  <section className="l-section l-band">
    <div className="l-wrap">
      <div className="l-section__head">
        <p className="l-eyebrow">The gap</p>
        <h2 className="l-h2">
          Transparency has been built into every layer, except the validators.
        </h2>
      </div>
      <div className="l-lineage">
        <span className="l-lin">
          <span className="l-lin__dot" /> L2Beat
        </span>
        <span className="l-lineage__arrow">
          <IArrowR size={16} />
        </span>
        <span className="l-lin">
          <span className="l-lin__dot" /> Walletbeat
        </span>
        <span className="l-lineage__arrow">
          <IArrowR size={16} />
        </span>
        <span className="l-lin is-now">
          <span className="l-lin__dot" /> Validator Beat
        </span>
      </div>
      <p className="l-prose" style={{ maxWidth: "820px" }}>
        Rollups have L2Beat. Wallets have Walletbeat. The validator operators securing tens of
        millions of staked ETH have had no way to differentiate themselves outside of performance
        and reputation. Stakers, from ETH holders to institutional allocators, choose an operator or
        protocol and forget about it. Compliance attestations like SOC 2 cover process and custody,
        but they say nothing about the choices that actually determine whether a validator stays safe
        and online: how signing keys are split, whether the operator runs a single client
        implementation, how concentrated their infrastructure is, and how much of that overlaps with
        the rest of the network.
      </p>
      <p className="l-pull">
        That invisible risk is <span className="hl">unpriced</span>. Validator Beat is the public
        entry point that compares these risks and gives operators a reason to compete on it.
      </p>
    </div>
  </section>
);

/* ---- §3 How validators actually fail -------------------------------------- */
const LFail = () => (
  <section className="l-section" id="how">
    <div className="l-wrap">
      <div className="l-section__head">
        <p className="l-eyebrow">Why it matters</p>
        <h2 className="l-h2">How validators actually fail</h2>
        <p className="l-lede">
          There are two ways a validator fails, and decentralization is the insurance against both.
        </p>
      </div>
      <div className="l-cards2">
        <article className="l-fcard">
          <div className="l-fcard__ico l-fcard__ico--safety">
            <ISlash size={24} />
          </div>
          <p className="l-fcard__tag l-fcard__tag--safety">Safety failure · slashing</p>
          <h3 className="l-h3">It signs something it never should have.</h3>
          <p className="l-fcard__desc">
            A double attestation, or a supermajority vote on the wrong chain. The protocol slashes
            the stake. This is the expensive failure.
          </p>
        </article>
        <article className="l-fcard">
          <div className="l-fcard__ico l-fcard__ico--live">
            <IPulse size={24} />
          </div>
          <p className="l-fcard__tag l-fcard__tag--live">Liveness failure · downtime</p>
          <h3 className="l-h3">It goes offline and misses its duties.</h3>
          <p className="l-fcard__desc">
            No slashing, but no rewards either, and a weaker network. The validator simply isn&apos;t
            there when it&apos;s needed.
          </p>
        </article>
      </div>
      <p className="l-note">
        Most safety and liveness issues trace back to a <strong>single point of failure</strong>:
        one machine, one team member, one client, one provider, one region. Validator Beat measures
        how many of those single points of failure an operator has removed.
      </p>
    </div>
  </section>
);

/* ---- §4 How VB reads an operator ------------------------------------------ */
const SLICE_DESC: Record<SliceId, string> = {
  keyCustody:
    "How signing keys are held, and how many independent parties must cooperate to sign.",
  clientDiversity: "Exposure to a bug in any single consensus or execution client.",
  infraDiversity: "Concentration on a single cloud or hosting provider.",
  osDiversity: "Correlated risk from running a single operating system across the fleet.",
  cpuDiversity: "Correlated risk from running a single chipset across the fleet.",
  geoDiversity:
    "Concentration in one region and exposure to power failure or natural disaster.",
};
const READ_LABEL: Record<SliceId, string> = {
  keyCustody: "Key Custody",
  clientDiversity: "Client Diversity",
  infraDiversity: "Provider Diversity",
  osDiversity: "OS Diversity",
  cpuDiversity: "CPU Architecture",
  geoDiversity: "Geographic Diversity",
};
const READ_SAMPLE: Answers = {
  keyCustody: "green",
  clientDiversity: "green",
  infraDiversity: "yellow",
  osDiversity: "green",
  cpuDiversity: "green",
  geoDiversity: "yellow",
};
const ORDER: SliceId[] = [
  "keyCustody",
  "clientDiversity",
  "infraDiversity",
  "geoDiversity",
  "osDiversity",
  "cpuDiversity",
];
const LRead = () => (
  <section className="l-section l-band">
    <div className="l-wrap">
      <div className="l-section__head">
        <p className="l-eyebrow">The assessment</p>
        <h2 className="l-h2">How Validator Beat assesses an operator</h2>
        <p className="l-lede">
          Most operators start exposed with two stages to climb and a six-slice risk profile.
        </p>
      </div>
      <div className="l-stages">
        <div className="l-stagecard l-stagecard--0">
          <div className="l-stagecard__top">
            <span className="l-stagebadge l-stagebadge--0">0</span>
            <div>
              <div className="l-stagecard__name">Stage 0 — Exposed</div>
              <div className="l-stagecard__kind">Starting point</div>
            </div>
          </div>
          <p className="l-stagecard__desc">
            At least one single point of failure remains. Most operators start here, it&apos;s the
            baseline.
          </p>
        </div>
        <div className="l-stagecard l-stagecard--1">
          <div className="l-stagecard__top">
            <span className="l-stagebadge l-stagebadge--1">1</span>
            <div>
              <div className="l-stagecard__name">Stage 1 — Slashing-averse</div>
              <div className="l-stagecard__kind">Safety</div>
            </div>
          </div>
          <p className="l-stagecard__desc">
            No single compromise of one machine, one team member, or one signer can produce a
            slashable message.
          </p>
        </div>
        <div className="l-stagecard l-stagecard--2">
          <div className="l-stagecard__top">
            <span className="l-stagebadge l-stagebadge--2">2</span>
            <div>
              <div className="l-stagecard__name">Stage 2 — Downtime-averse</div>
              <div className="l-stagecard__kind">Liveness</div>
            </div>
          </div>
          <p className="l-stagecard__desc">
            No single point of failure in the operator&apos;s infrastructure can take the validator
            offline. This is the end game.
          </p>
        </div>
      </div>
      <div className="l-read">
        <div className="l-read__pizza">
          <Pizza answers={READ_SAMPLE} size={300} showCenter={false} glowOpacity={0.26} />
          <span className="l-hero__cap">
            Each slice scored <b style={{ color: "#20705c" }}>green</b>,{" "}
            <b style={{ color: "#9a7012" }}>yellow</b>, or <b style={{ color: "#b0492f" }}>red</b>
          </span>
        </div>
        <div className="l-slices">
          {ORDER.map((id) => (
            <div className="l-slice" key={id}>
              <div className="l-slice__h">
                <span
                  className="l-slice__dot"
                  style={{ background: FUNC[READ_SAMPLE[id] as keyof typeof FUNC] }}
                />{" "}
                {READ_LABEL[id]}
              </div>
              <p className="l-slice__d">{SLICE_DESC[id]}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="l-read__foot">
        This can be read at a glance. For the exact thresholds and rubric, see the{" "}
        <Link className="llink" href={METHODOLOGY} style={{ display: "inline-flex" }}>
          methodology
        </Link>
        . To see where your own validator lands,{" "}
        <Link className="llink" href={ASSESS} style={{ display: "inline-flex" }}>
          take the assessment <IArrowR size={15} />
        </Link>
        .
      </p>
      <p className="l-read__dis">Validator Beat is self-reported and consent-based.</p>
    </div>
  </section>
);

/* ---- §5 Both sides -------------------------------------------------------- */
const LSides = () => (
  <section className="l-section">
    <div className="l-wrap">
      <div className="l-section__head">
        <p className="l-eyebrow">Who it&apos;s for</p>
        <h2 className="l-h2">Built for both sides of the stake</h2>
      </div>
      <div className="l-sides">
        <div className="l-side">
          <p className="l-side__k">If you delegate your ETH</p>
          <h3 className="l-side__h">Read any operator&apos;s profile in five seconds.</h3>
          <p className="l-side__p">
            Before you stake, not after an incident. Two stages and six colors give you insight into
            validator operations that the marketing page never will.
          </p>
        </div>
        <div className="l-side">
          <p className="l-side__k">If you&apos;re an operatooor</p>
          <h3 className="l-side__h">Proof of work.</h3>
          <p className="l-side__p">
            Run the assessment, earn your stages, and show off your pizza wherever you list your
            product. Operators who have removed their single points of failure now have a way to show
            it.
          </p>
          <div className="l-side__cta">
            <Link className="lbtn lbtn--primary" href={ASSESS}>
              Assess your validator <IArrowR size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ---- §6 valOS ------------------------------------------------------------- */
const LValos = () => (
  <section className="l-section l-band">
    <div className="l-wrap">
      <div className="l-valos">
        <div>
          <p className="l-eyebrow">The standard behind the score</p>
          <h2 className="l-h2">Validator Beat and valOS</h2>
          <p className="l-prose">
            Validator Beat is the public-facing <strong>who</strong> is running validators. valOS,
            the Validator Operating Standard, is the technical <strong>how</strong>: a deep catalog
            of the controls and mitigations behind professional validator operations.
          </p>
          <p className="l-prose">
            A staker can quickly read an operator&apos;s stages and profile here. An operator doing
            the hard work and implementing the mitigations should dig into valOS. Follow valOS, and
            you&apos;ll end up at stage 2.
          </p>
          <div className="l-ctarow">
            <a
              className="lbtn lbtn--ghost"
              href={VALOS}
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about valOS <IExt size={16} />
            </a>
          </div>
        </div>
        <div className="l-whohow">
          <div className="l-whohow__box">
            <div className="l-whohow__k">Validator Beat</div>
            <div className="l-whohow__v">
              The <b>who</b> — the public dashboard
            </div>
          </div>
          <div className="l-whohow__arrow">
            <IArrowD size={20} />
          </div>
          <div className="l-whohow__box">
            <div className="l-whohow__k">valOS</div>
            <div className="l-whohow__v">
              The <b>how</b> — the operating standard
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

/* ---- §7 Neutral standard -------------------------------------------------- */
const LNeutral = () => (
  <section className="l-section">
    <div className="l-wrap">
      <div className="l-section__head">
        <p className="l-eyebrow">Credibility</p>
        <h2 className="l-h2">A neutral dashboard, built in the open</h2>
        <p className="l-prose">
          Validator Beat is co-authored by Obol and Lido. It is deliberately neutral and no single
          team owns the rubric. The methodology is public and is meant to be adopted, challenged,
          and improved by the whole ecosystem.
        </p>
        <p className="l-prose">
          The goal is a <strong>race to the top</strong>, where transparency about validator risk
          becomes the default expectation.
        </p>
        <div className="l-authors">
          <span className="l-author">
            <span className="l-author__dot" /> Obol
          </span>
          <span className="l-author">
            <span className="l-author__dot l-author__dot--lido" /> Lido
          </span>
        </div>
      </div>
    </div>
  </section>
);

/* ---- §8 Closing CTA + footer ---------------------------------------------- */
const LClosing = () => (
  <section className="l-closing">
    <div className="l-wrap">
      <h2 className="l-closing__h">Find out how secure your validator really is.</h2>
      <div className="l-closing__row">
        <Link className="lbtn lbtn--onDark lbtn--lg" href={ASSESS}>
          Assess your validator <IArrowR size={17} />
        </Link>
      </div>
      <div className="l-closing__row" style={{ marginTop: "20px" }}>
        <Link className="l-closing__link" href={METHODOLOGY}>
          Read the methodology
        </Link>
        <span className="l-closing__sep">·</span>
        <a className="l-closing__link" href={VALOS} target="_blank" rel="noopener noreferrer">
          Explore valOS
        </a>
      </div>
    </div>
  </section>
);
const LFooter = () => (
  <footer className="l-foot">
    <div className="l-wrap">
      <span className="l-foot__brand">
        Validator <b>Beat</b>
      </span>
      <span className="l-foot__note">
        A simple view into validator operations
      </span>
      <span className="l-foot__spacer" />
      <Link className="l-foot__link" href={METHODOLOGY}>
        Methodology
      </Link>
      <a className="l-foot__link" href={VALOS} target="_blank" rel="noopener noreferrer">
        valOS
      </a>
      <Link className="l-foot__link" href={ASSESS}>
        Assess
      </Link>
    </div>
  </footer>
);

export function Landing() {
  return (
    <div className="vb-landing">
      <LNav />
      <LHero />
      <LGap />
      <LFail />
      <LRead />
      <LSides />
      <LValos />
      <LNeutral />
      <LClosing />
      <LFooter />
    </div>
  );
}
