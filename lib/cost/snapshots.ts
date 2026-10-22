/**
 * Pinned snapshots: a frozen copy of the network state and the page defaults
 * as published on a given day. A link with `snap=<id>` uses them instead of
 * the latest, so numbers quoted in a report or PDF keep matching the page.
 *
 * To publish new defaults or refresh data/network/snapshot.json, add a new
 * file in data/network/pinned/ and register it here; never edit an old one.
 * (Changes to the model code itself can still move pinned numbers; the
 * regression tests in cost.test.ts make such changes deliberate.)
 */
import pinned20261019 from "../../data/network/pinned/2026-10-19.json";

export interface PinnedSnapshot {
  id: string;
  network: { totalActiveEth: number; activeValidators: number; asOf: string };
  defaults: Record<string, unknown>;
}

export const PINNED: Record<string, PinnedSnapshot> = {
  "2026-10-19": pinned20261019 as PinnedSnapshot,
};

/** The newest pinned snapshot: what a "pinned link" pins to today. */
export const LATEST_PIN = "2026-10-19";
