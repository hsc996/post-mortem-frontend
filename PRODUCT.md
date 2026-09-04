# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: a solo responder triage-handling a live, high-consequence incident, under acute time pressure and cognitive stress, often at unsociable hours. Also used by responders collaborating on the same incident concurrently (hence optimistic locking) and by admins/viewers reviewing incidents and audit history after the fact. Backend-enforced roles: `admin`, `responder`, `viewer`.

The product is horizontal, not software-only: on-call software engineering (Sev-1 outages on SaaS infrastructure) is the illustrative example and the shape the current data model is written in (`service_name`, incident/mitigation vocabulary), but the product is positioned to fit any business managing high-consequence, time-critical incidents — the mechanism (severity, status, timed mitigations, audit trail) generalizes beyond engineering even though the field names haven't been abstracted yet.

## Product Purpose

PostMortem is a real-time incident tracking and mitigation dashboard for high-consequence, time-critical situations. It replaces unstructured incident docs/wiki pages with a deterministic system of record — built for instant legibility and safe concurrent editing during a live incident, not for leisurely retrospective writing. Software on-call is the current implementation's home domain and primary example; the product is positioned as usable by any business with a similar high-stakes, time-critical response need.

## Positioning

A real-time deterministic state engine, not a static doc. Three mechanisms a wiki page cannot replicate:
- **Read-time truth:** a mitigation's expiry (`is_expired`) is evaluated dynamically at query time from `applied_at` + `ttl_minutes`, never trusted from a stale push.
- **Optimistic locking:** every mutation submits the current `version`; a stale version is rejected with `409 Conflict` instead of silently clobbering a concurrent responder's edit.
- **Immutable audit trail:** every mutation writes an append-only `audit_logs` entry in the same transaction — audit is infrastructure, not a feature the user operates.

## Operating Context

- Used live during active incidents, frequently solo and under acute stress, but with real concurrent multi-responder edits on the same incident (the reason optimistic locking exists).
- Talks to a companion backend in the sibling repo `post-mortem` (FastAPI + PostgreSQL, app title "PostMortem API"), over REST at `/api/v1`. That backend's models/schemas/routers are ground truth for data shapes — supersedes the backend's own early planning doc, which the product owner confirmed the implementation has diverged from.
- Core entities (confirmed from backend source, not the planning doc):
  - **Incident:** title, description, `service_name`, `severity` (`low`/`medium`/`high`/`critical`), `status` (`open`/`mitigated`/`resolved`), `version`, `reporter`, optional `assignee`, `resolved_at`, derived `mttr_seconds` (time-to-resolution, only once resolved).
  - **MitigationState:** at most one per incident (1:1), with `summary`, `ttl_minutes`, `applied_at`/`applied_by`, and derived `is_expired`.
  - **AuditLog:** `entity_type`/`entity_id`, `action`, `actor`, `changes` (JSON), `ip_address`, optional `incident_id`.
  - **User:** email, name, `role` (`admin`/`responder`/`viewer`), `phone`, `is_active`.
- Auth is JWT-based (register/login/logout/me; role updates are admin-gated).

## Capabilities and Constraints

- Confirmed backend capabilities today: create/list/get/update/resolve incidents; fetch an incident's own audit log; create/get/clear a single mitigation on an incident; list all audit logs and fetch one entity's audit trail; register/login/logout/me/update-role.
- **No shift-handover feature exists in the implemented backend.** The backend's early build-plan document described a "deterministic shift-handover snapshot," but the product owner confirmed the real implementation strayed from that plan. Treat shift handovers as unbuilt and undecided — do not design or build against it as if it were a current or committed capability.
- Optimistic-lock conflicts (409, stale `version`) are an expected, real operational event during concurrent responder edits — the frontend must surface this honestly as its own state, not as a generic error.
- Mitigation expiry is computed read-time by the backend, not pushed — the frontend should poll/refetch or compute a live countdown client-side rather than assume server-initiated updates.

## Brand Commitments

Product name is **PostMortem** — confirmed by the product owner and matching the backend's FastAPI app title ("PostMortem API") and health-check service name. The backend's early planning document used the working name "PulseGuard"; that name is superseded and must not be used in product-facing copy.

## Evidence on Hand

- Sibling backend repo at `post-mortem` (FastAPI + PostgreSQL/SQLAlchemy) is the live API this frontend integrates with.
- No real incident data, screenshots, testimonials, or brand assets exist yet. The only assets currently in `src/assets` (`hero.png`, `react.svg`, `vite.svg`) are leftovers from the unmodified Vite/React starter template — not product-relevant, not brand assets.
- The backend's `post-mortem-build-plan.md` names a shift-handover feature and an ARQ/Redis proactive-alert worker; neither is confirmed as implemented or committed — do not treat either as fact without re-checking backend source.

## Product Principles

1. Legibility over decoration — every screen must read correctly at 2am, under fatigue and time pressure.
2. Make concurrency visible, not hidden — version conflicts and stale state are real operational events the UI must surface honestly.
3. Read-time truth over cached state — derived facts like TTL expiry are computed live, not assumed from the last fetch.
4. Audit everything, silently — the audit trail is infrastructure the user benefits from, not a feature they manage.
5. Speed of action beats completeness of workflow — this is a triage tool for the moment of crisis, not a general project-management surface.

## Accessibility & Inclusion

ICU-grade legibility under acute fatigue: minimum 4.5:1 color contrast for status indicators, zero layout shift, minimum 44px touch targets, robust dark-mode support for overnight use, and high-visibility treatment for expired-TTL mitigations. No formal compliance standard (e.g. a specific WCAG level) has been mandated.
