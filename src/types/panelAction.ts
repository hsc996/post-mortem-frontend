import type { Incident } from "./incident";

/** Result of a detail-panel mutation attempt, mirroring what a real API response would carry. */
export type PanelActionResult =
  | { ok: true; incident: Incident }
  | { ok: false; kind: "conflict"; expected: number; current: number }
  | { ok: false; kind: "blocked"; reason: string };
