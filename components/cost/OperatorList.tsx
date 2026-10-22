import { Box, Text } from "@obolnetwork/obol-ui";
import { fmtEth } from "@lib/cost/format";
import { operatorsOf } from "@lib/cost/model";
import {
  DEFAULT_PARAMS,
  MAX_OPERATORS,
  formatOps,
  parseOps,
  type CostParams,
  type Operator,
} from "@lib/cost/params";
import { Chips, NumberField, Slider } from "./controls";
import * as s from "./styles";

interface Props {
  params: CostParams;
  update: (patch: Partial<CostParams>) => void;
}

const smallButton = {
  all: "unset",
  cursor: "pointer",
  fontSize: "$2",
  fontWeight: "$semibold",
  color: s.LINK,
  textDecoration: "underline",
  "&:focus-visible": {
    outline: "2px solid var(--theme-brand)",
    outlineOffset: 2,
    borderRadius: 3,
  },
} as const;

/**
 * Your operators: an equal split (count × network share), or a list of
 * operators of different sizes, each with its own stake and network share.
 * The list lives in the URL as `ops=stake:share,…`.
 */
export function OperatorList({ params: p, update }: Props) {
  const list = parseOps(p.opList);
  const custom = list !== null;

  const setOps = (ops: Operator[]) =>
    update({
      opList: formatOps(ops),
      stakeEth: Math.round(ops.reduce((a, o) => a + o.stakeEth, 0)),
      operators: ops.length,
    });

  return (
    <Box css={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <Chips
        label="Your operators"
        value={custom ? "list" : "equal"}
        options={[
          {
            id: "equal",
            label: "Equal split",
            hint: "Your stake split evenly across operators of the same size.",
          },
          {
            id: "list",
            label: "Different sizes",
            hint: "List each operator's stake and its share of all staked ETH.",
          },
        ]}
        onChange={(id) => {
          if (id === "list" && !custom)
            setOps(
              operatorsOf(p).map((o) => ({
                stakeEth: Math.round(o.stakeEth),
                sharePct: o.sharePct,
              })),
            );
          if (id === "equal" && custom)
            update({
              opList: "",
              operatorSharePct:
                list![0]?.sharePct ?? DEFAULT_PARAMS.operatorSharePct,
            });
        }}
      />

      {!custom ? (
        <>
          <Slider
            label="Each operator's share of all staked ETH"
            value={p.operatorSharePct}
            min={0.5}
            max={33}
            step={0.5}
            format={(v) => `${v}%`}
            defaultValue={DEFAULT_PARAMS.operatorSharePct}
            onChange={(v) => update({ operatorSharePct: v })}
            hint="The operator's whole book, not just your slice. A compromise there affects all of it, and the correlation penalty and exit queues scale with it."
          />
          <Slider
            label="Split your stake across"
            value={p.operators}
            min={1}
            max={MAX_OPERATORS}
            step={1}
            format={(v) => (v === 1 ? "1 operator" : `${v} operators`)}
            defaultValue={DEFAULT_PARAMS.operators}
            onChange={(v) => update({ operators: v })}
            hint="Each runs its share alone. Splitting shrinks each loss but adds more chances of one. Run together as a multi-operator DV, the same operators remove the single point of failure instead."
          />
        </>
      ) : (
        <Box css={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Box
            as="ol"
            css={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {list!.map((op, i) => (
              <Box
                as="li"
                key={i}
                css={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.3fr) minmax(0, 1fr) auto",
                  gap: 10,
                  alignItems: "end",
                  "@media (max-width: 420px)": {
                    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
                  },
                }}
              >
                <NumberField
                  label={`Operator ${i + 1}: your stake`}
                  value={op.stakeEth}
                  min={1}
                  max={10_000_000}
                  suffix="ETH"
                  onChange={(v) =>
                    setOps(
                      list!.map((o, j) =>
                        j === i ? { ...o, stakeEth: v } : o,
                      ),
                    )
                  }
                />
                <NumberField
                  label="Its network share"
                  value={op.sharePct}
                  min={0.1}
                  max={33}
                  suffix="%"
                  onChange={(v) =>
                    setOps(
                      list!.map((o, j) =>
                        j === i ? { ...o, sharePct: v } : o,
                      ),
                    )
                  }
                />
                {list!.length > 1 && (
                  <Box
                    as="button"
                    type="button"
                    aria-label={`Remove operator ${i + 1}`}
                    onClick={() => setOps(list!.filter((_, j) => j !== i))}
                    css={{ ...smallButton, paddingBottom: 10 }}
                  >
                    Remove
                  </Box>
                )}
              </Box>
            ))}
          </Box>
          <Box
            css={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            {list!.length < MAX_OPERATORS && (
              <Box
                as="button"
                type="button"
                onClick={() =>
                  setOps([
                    ...list!,
                    { stakeEth: list![list!.length - 1].stakeEth, sharePct: 1 },
                  ])
                }
                css={smallButton}
              >
                + Add an operator
              </Box>
            )}
            <Text css={{ ...s.small }}>
              Total {fmtEth(p.stakeEth)} across {list!.length} operator
              {list!.length === 1 ? "" : "s"}
            </Text>
          </Box>
        </Box>
      )}

      <Slider
        label="Extra multi-operator DV members"
        value={p.extraNodes}
        min={0}
        max={3}
        step={1}
        format={(v) => (v === 0 ? "none" : v === 1 ? "1 node" : `${v} nodes`)}
        defaultValue={DEFAULT_PARAMS.extraNodes}
        onChange={(v) => update({ extraNodes: v })}
        hint="Cluster members that hold no stake of their own, such as your own node alongside your operators. They add resilience to the DV, but also another place a key can leak, so they count towards the DV's incidents."
      />
    </Box>
  );
}
