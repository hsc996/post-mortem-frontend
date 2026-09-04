import type { Incident } from "../types/incident";
import { ago } from "../lib/time";

// Synthetic demonstration data — no live backend is wired up yet. Shaped
// to match the post-mortem API's actual schema so it drops in cleanly
// once that wiring happens.

export const mockIncidents: Incident[] = [
  {
    id: "a1",
    title: "Checkout failing for EU customers",
    description:
      "Card charges are failing at the final confirmation step for customers billing in EUR. GBP and USD checkouts are unaffected. First reports came in from the EU storefront ~6 minutes ago; error rate is climbing.",
    serviceName: "payments-api",
    severity: "critical",
    status: "open",
    version: 1,
    reporterName: "R. Okafor",
    assigneeName: null,
    createdAt: ago(6),
    resolvedAt: null,
    mitigation: null,
  },
  {
    id: "a2",
    title: "Elevated login latency after cert rotation",
    description:
      "Login p95 jumped from ~200ms to 4-6s immediately after the scheduled TLS cert rotation on edge nodes. Suspect the new chain isn't being cached correctly by the CDN's OCSP stapling.",
    serviceName: "auth-service",
    severity: "high",
    status: "mitigated",
    version: 1,
    reporterName: "T. Álvarez",
    assigneeName: "T. Álvarez",
    createdAt: ago(54),
    resolvedAt: null,
    mitigation: {
      summary: "Pinned previous cert chain on edge nodes",
      ttlMinutes: 90,
      appliedAt: ago(31),
      appliedByName: "T. Álvarez",
    },
  },
  {
    id: "a3",
    title: "Search results stale across all regions",
    description:
      "Search index hasn't picked up catalog changes since roughly 03:30Z. Incremental sync workers are running but not writing — likely stuck on a poison message. No customer-facing errors, results are just outdated.",
    serviceName: "search-index",
    severity: "high",
    status: "mitigated",
    version: 1,
    reporterName: "J. Meng",
    assigneeName: "J. Meng",
    createdAt: ago(210),
    resolvedAt: null,
    mitigation: {
      summary: "Forced manual reindex, disabled incremental sync",
      ttlMinutes: 60,
      appliedAt: ago(96),
      appliedByName: "J. Meng",
    },
  },
  {
    id: "a4",
    title: "Invoice retries queuing beyond SLA",
    description:
      "Failed invoice charges are retrying correctly but the retry queue's backlog now exceeds the 30-minute SLA. No charges are being lost, but affected customers are seeing delayed dunning emails.",
    serviceName: "billing-worker",
    severity: "medium",
    status: "open",
    version: 1,
    reporterName: "S. Kowalski",
    assigneeName: "S. Kowalski",
    createdAt: ago(22),
    resolvedAt: null,
    mitigation: null,
  },
  {
    id: "a5",
    title: "Delayed push notifications during deploy",
    description:
      "A rolling deploy of the notification workers left a brief window where push delivery queued instead of sending. All queued notifications delivered once the deploy completed; no data was lost.",
    serviceName: "notification-service",
    severity: "medium",
    status: "resolved",
    version: 2,
    reporterName: "H. Scaife",
    assigneeName: "H. Scaife",
    createdAt: ago(640),
    resolvedAt: ago(590),
    mitigation: null,
  },
  {
    id: "a6",
    title: "Elevated 404 rate on legacy image paths",
    description:
      "A CDN cache-key change dropped support for a legacy image path format still used by older mobile clients. Newer clients and the web app were unaffected throughout.",
    serviceName: "static-assets-cdn",
    severity: "low",
    status: "resolved",
    version: 2,
    reporterName: "R. Okafor",
    assigneeName: "R. Okafor",
    createdAt: ago(1400),
    resolvedAt: ago(1250),
    mitigation: null,
  },
];

/**
 * Shaped like a real fetch (async, rejectable) even though it's backed by
 * the mock array above, so the error/retry path this powers is real code
 * exercised against real timing, not a decoration — and swapping in a real
 * `fetch(...)` later only changes this function's body.
 */
export function fetchIncidents(): Promise<Incident[]> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(mockIncidents), 420);
  });
}
