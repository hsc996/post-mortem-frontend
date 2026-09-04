---
name: PostMortem
description: A wire desk for live incidents — bulletins, not cards.
colors:
  paper: "#f2ead7"
  paper-dim: "#e7dcc2"
  paper-raised: "#faf5e8"
  ink: "#211d14"
  ink-dim: "#5c5340"
  steel: "#2c3134"
  steel-dim: "#6b7176"
  rule: "#c9bb98"
  nominal: "#2f6b3a"
  amber: "#7a5a10"
  alarm: "#a3271a"
  alarm-muted: "#8a4a3a"
  alarm-ink: "#faf5e8"
typography:
  display:
    fontFamily: "Orbitron, Arial, sans-serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "0.02em"
  title:
    fontFamily: "Chakra Petch, Arial, sans-serif"
    fontSize: "clamp(1.125rem, 1.05rem + 0.3vw, 1.25rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.1em"
rounded:
  none: "0px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "20px"
  lg: "32px"
components:
  button-claim:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 16px"
    height: "44px"
  button-claim-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  status-tag-open:
    textColor: "{colors.amber}"
    typography: "{typography.label}"
  status-tag-mitigated:
    textColor: "{colors.nominal}"
    typography: "{typography.label}"
  status-tag-resolved:
    textColor: "{colors.ink-dim}"
    typography: "{typography.label}"
  mitigation-readout-expired:
    backgroundColor: "{colors.alarm}"
    textColor: "{colors.alarm-ink}"
    padding: "6px 10px"
  conflict-notice:
    backgroundColor: "{colors.alarm}"
    textColor: "{colors.alarm-ink}"
    padding: "12px"
  segment-active:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    height: "44px"
---

# Design System: PostMortem

## Overview

**Creative North Star: "The Incident Wire"**

PostMortem's dashboard is not a status-card grid — it's a continuous wire feed, the same discipline a newsroom telex applies to incoming copy: timestamped, precedence-graded, append-only, never silently edited. This is a deliberate refusal of the generic-SaaS dashboard default (colored status pills in a card grid); the system's own thesis is that the audit-trail discipline the product is built on — nothing is silently overwritten, every action punches a new line — deserves a visual form that behaves the same way. The page reads top-down like dispatch copy, most urgent and most recent first, not as a dashboard the eye has to hunt across.

The palette is near-monochrome by design: warm manila paper and dark ink by day, gunmetal ground and amber ink by night — the same machine under a different light source, not an inverted theme. Against that neutral field sit two reserved signal-lamp colors, nominal green and alarm red, plus a third traffic-light rung, amber, spent on exactly one job: the OPEN status. Nominal green means "still live, working as expected." Alarm red — as a solid fill — means "this needs a human now," and its quieter cousin, alarm-muted, carries the same meaning at a lower volume for inline error text and non-blocking load failures. Severity itself never touches color at all — FLASH/URGENT/BULLETIN/ROUTINE is a typographic ladder of weight and size, the wire service's own precedence vocabulary. The desk gained a second typographic voice since its first cut: Orbitron for the masthead nameplate alone, and Chakra Petch reserved for an incident's own title and the two slide-over panels that carry one. Everything else — status, meta lines, the audit trail, every form field, every button label — still runs in JetBrains Mono, the machine's own instrumentation face. Every surface is flat: no shadows, no rounded corners anywhere except the two functional live-pulse dots. New surfaces (the incident detail panel, the new-incident form, the admin user directory) mount with a shared, quiet spring stagger rather than snapping into place, but the system stays otherwise as restrained as it always was: nothing decorative, nothing added for warmth that isn't earned by function.

**Key Characteristics:**
- Continuous append-only feed, not a card grid — one bulletin per incident, dividers not gutters.
- Near-monochrome manila/gunmetal palette with a three-color status ladder (amber/nominal/dim) and two reserved alarm colors (full-fill alarm, quieter alarm-muted) that never do routine-status duty.
- Severity communicated by typography (weight, size, tracking), never by color.
- Two typographic voices, both rare: Orbitron for the masthead only, Chakra Petch for incident titles and panel headings only. Everything else is JetBrains Mono.
- Zero shadows, zero border-radius except the two functional pulse dots.
- Day desk / night desk: light and dark are two lighting conditions on one machine, not an inversion.
- New panels and lists mount with a shared staggered-spring entrance; the choreography is a system rule, not a one-off flourish.

## Colors

Near-monochrome by design — every color decision defends the rule that a hue only ever means one thing.

### Primary
- **Nominal Green** (`#2f6b3a` day / `#43c463` night): the "still live, working as expected" signal. Drives the header's LIVE pulse dot, the MITIGATED status tag (with pulse dot), the focus ring, and text-selection color. A signal of normal operation, not an alert.
- **Amber** (`#7a5a10` day / `#e0b83d` night): the third rung of the status traffic light, spent on exactly one job — the OPEN status tag and its pulse dot ("needs action, nothing done yet"). Distinct from both Nominal (stable/monitored) and Alarm (needs a human now); OPEN is neither of those, so it gets its own hue rather than borrowing one.
- **Alarm Red** (`#a3271a` day / `#ff4d3d` night): reserved for genuine, blocking alarm states rendered as a solid fill with `Alarm Ink` text — the expired-mitigation banner and the version-conflict notice. Never used for a routine status.
- **Alarm Muted** (`#8a4a3a` day / `#d66b5c` night): the same alarm meaning at inline volume — a bordered, text-only treatment for non-blocking failures (a form validation error, a directory load failure, a session-expired notice, the feed's own "WIRE DOWN" state). It never gets a solid fill; that treatment is reserved for Alarm Red's two blocking states.
- **Alarm Ink** (`#faf5e8` day / `#17181a` night): the text/border color that sits on top of an Alarm Red fill, and the inverse color on that control's hover/focus state.

### Neutral
- **Manila Paper** (`#f2ead7` day / `#17181a` night): the page ground. Warm parchment under office light; near-black gunmetal under a night desk lamp.
- **Aged Manila** (`#e7dcc2` day / `#202225` night): the hover tint on a bulletin row — a shade darker than the page, never a shadow.
- **Bright Manila** (`#faf5e8` day / `#1e2023` night): the raised-surface value behind both slide-over panels (incident detail, new-incident form) — a lighter paper than the page ground beneath it.
- **Wire Ink** (`#211d14` day / `#e9dab5` night): primary text. Near-black on paper by day; warm amber on gunmetal by night.
- **Faded Wire Ink** (`#5c5340` day / `#a3906a` night): secondary/meta text — reporter lines, timestamps, dim labels, and the RESOLVED status tag.
- **Gunmetal** (`#2c3134` day / `#d7dade` night): a separate cool gray-blue reserved for the masthead's double-rule border only — structural chrome, distinct from the warm paper/ink family it sits above.
- **Dim Gunmetal** (`#6b7176` day / `#8d9297` night): scrollbar chrome only.
- **Manila Rule** (`#c9bb98` day / `#3a3d40` night): the hairline divider between bulletins, and the border around every button, chip, segmented control, and input field on the desk.

### Named Rules
**The Reserved-Signal Rule.** Amber, Nominal, and Alarm each mean exactly one thing and never trade places: Amber is "open, needs action." Nominal is "live and working as expected." Alarm (full fill) is "needs a human right now"; Alarm Muted is the same meaning at inline, non-blocking volume. A state that is merely open is never colored red, and a state that has actually gone wrong is never colored green.

**The Day Desk / Night Desk Rule.** Light and dark mode are not an inverted palette — they're two lighting conditions on the same machine (`prefers-color-scheme`, not a manual toggle). Every neutral and every signal color gets an explicit day value and an explicit night value; neither is derived by inverting the other.

## Typography

**Display Font:** Orbitron (weights 700/800, self-hosted via `@fontsource/orbitron`), with Arial/sans-serif fallback
**Title Font:** Chakra Petch (weights 500/600/700, self-hosted via `@fontsource/chakra-petch`), with Arial/sans-serif fallback
**Body/Label Font:** JetBrains Mono (with ui-monospace, SFMono-Regular, Menlo, Consolas, monospace fallback)

**Character:** Three faces, two of them spent on almost nothing. Orbitron — geometric, wide, technical — appears in exactly one place: the "POSTMORTEM" masthead nameplate, on every top-level screen (the wire desk, the login screen, the admin directory). Chakra Petch — a squarer, slightly more human display face — is spent only on an incident's own title (bulletin row and detail panel) and the two panel headings that front a form ("FILE NEW INCIDENT"). Everything else on the desk — status tags, precedence stamps, meta lines, every button and form label, the audit trail, the role toggle, empty/error-state headings, the "— 30 —" sign-off — runs in JetBrains Mono, the machine's own instrumentation face, with no special treatment. `font-feature-settings: "tnum" 1` is set globally so every live-updating numeral (clock, elapsed time, countdown) holds a fixed width and never jitters the layout as digits change.

### Hierarchy
- **Display** (800, 20px→24px, tight tracking, uppercase, Orbitron): the "POSTMORTEM" masthead nameplate. Appears once per top-level screen — the wire desk header, the login screen, and the admin directory header all repeat it identically.
- **Title** (600, 18px→20px, Chakra Petch): an incident's own title (bulletin row and detail panel), and a slide-over panel's own heading ("FILE NEW INCIDENT"). The only other place Chakra Petch appears.
- **Body** (400, 12px–14px, JetBrains Mono): reporter lines, elapsed-time strings, mitigation summaries, form help text — the day-to-day meta copy of the desk.
- **Label** (600, 11px–12px, 0.1em tracking, uppercase, JetBrains Mono): status tags, precedence stamps, button and form-field labels, the role toggle, the "LIVE" indicator, and the "ALL CLEAR" / "WIRE DOWN" state headings.

### Named Rules
**The Two-Voice Rule.** Orbitron is spent on exactly one element: the masthead nameplate, repeated identically wherever it appears. Chakra Petch is spent on exactly two: an incident's title and a slide-over panel's own heading. Every other element on the desk — including every button, badge, tab, and status word — runs in JetBrains Mono. Two display faces used everywhere would stop being voices; PostMortem keeps both rare on purpose.

**The Precedence-By-Weight Rule.** Severity is FLASH / URGENT / BULLETIN / ROUTINE — words, never a color chip — and each step down the ladder loses weight, size, and tracking in the same motion: FLASH is 15px/bold/0.08em, ROUTINE is 12px/medium/0.06em and dimmed to `ink-dim`. A reader triages by glancing at type density alone.

## Layout

A single continuous column, never a multi-column grid. Content is constrained to a `max-w-4xl` (896px) reading column, centered, with horizontal padding of 20px at the base breakpoint widening to 32px at the 640px (`sm`) breakpoint. The two slide-over panels (incident detail, new-incident form) are the one deliberate exception to the single-column rule: on mobile they dock full-width at the bottom of the viewport; at `sm` and above they become a fixed right-hand panel (max-width 28rem→32rem) beside the feed, and the feed's own container gains matching right padding so it never sits underneath the open panel. Vertical rhythm: 16px vertical padding per bulletin row, 24px around the feed's closing "— 30 —" mark, 64–80px for loading/empty/error states. Rows are separated by hairline dividers, not gutters or card shadows.

## Elevation & Depth

Flat, with zero exceptions. There is no `box-shadow` anywhere in the codebase. Depth is conveyed entirely by stroke weight and background-tint delta: a 1px hairline (`Manila Rule`) divides ordinary rows, a 4px **double** rule (`Gunmetal`) marks every masthead as structurally separate from the content beneath it, and a hover state on a bulletin row is a flat tint shift to `Aged Manila`, never a lift or a shadow. The slide-over panels achieve their sense of layering purely through motion (a slide transform) and a slightly lighter background (`Bright Manila` vs. the page's `Manila Paper`), not through a shadow. Both the expired-mitigation alarm and the version-conflict notice are solid fills, not elevated cards — urgency is announced by color and weight, never by simulated height.

### Named Rules
**The Flat Wire Rule.** No shadow, ever. If something needs to feel more important, it gets a heavier border, a lighter/raised paper tone, or one of the reserved signal colors — never a drop shadow pretending the screen has depth it doesn't.

## Shapes

Every rectangular surface — buttons, dividers, form fields, segmented controls, the mitigation readout, the alarm and conflict blocks — sits at 0 radius. The only curves in the entire system are the live-pulse status dots (in the header's "LIVE" indicator and an OPEN/MITIGATED status tag), and those are functional signal chrome, not decoration. Containment is expressed through border strokes at three weights: 1px hairline for dividers, buttons, and inputs; 4px double-rule for every masthead; and a solid fill (no border) for the two blocking alarm-state blocks.

### Named Rules
**The Right-Angle Rule.** Radius is reserved for exactly one thing: the circular pulse indicator that means "this is live." Every other shape in the system — including every new form field, segmented control, and panel — is a hard rectangle.

## Components

Restrained and exacting — every component behaves like dispatch-desk equipment (stamp, claim, log, directory), not like a persuasive UI trying to be liked.

### Buttons
- **Shape:** hard rectangle, 0 radius, 1px `Wire Ink` outline, no fill at rest, minimum 44px height (touch-target floor, applied without exception).
- **Claim / primary action:** transparent background, `Wire Ink` text and border, 16px horizontal padding, 12px/600/0.1em-tracked uppercase label, JetBrains Mono.
- **Hover / Focus:** the entire button inverts — fill becomes `Wire Ink`, text becomes `Manila Paper` — on both `:hover` and `:focus-visible`, so keyboard and pointer users get an identical, unambiguous confirmation.
- **Claimed state (not a button):** once claimed, the control becomes a static stamp — 1px `Manila Rule` border, `Faded Wire Ink` text, "CLAIMED — [NAME]" — a permanent mark rather than a toggle, matching the product's claim-as-stamp story.
- **Alarm-context button (Reload Latest):** the same invert-on-hover pattern, but built from the alarm pair instead — `Alarm Ink` outline/text on an `Alarm Red` block, inverting to `Alarm Red` text on `Alarm Ink`.

### Chips
- **Status Tag — three-way traffic light.** OPEN renders in `Amber` with a pulsing dot. MITIGATED renders in `Nominal Green` with a pulsing dot. RESOLVED renders in flat `Faded Wire Ink` with no dot. No background fill, no border on any of the three — the chip is text and, when live, one small animated dot.

### Segmented Controls (signature pattern)
A single bordered strip divided by 1px vertical rules, minimum 44px per segment, active segment inverted to `Wire Ink` fill / `Manila Paper` text — everything else dim `Faded Wire Ink`. The same pattern, unchanged, drives three unrelated controls: the severity picker in the new-incident form, the three-way role toggle (ADMIN/RESPONDER/VIEWER) in the admin directory, and the SIGN IN / REGISTER tab on the login screen. One control vocabulary, reused rather than reinvented per surface.

### Cards / Containers
- **Incident Bulletin (the feed row):** no card shell — a 1px `Manila Rule` bottom border is the only boundary, full-bleed against the page background. Resolved incidents drop to 70% opacity rather than changing color, keeping severity and status legible through weight, not just through fading.
- **Background:** `Manila Paper`; hover shifts the row to `Aged Manila` at 60% opacity.
- **Shadow Strategy:** none — see Elevation & Depth.
- **Internal Padding:** 16px vertical, 20px→32px horizontal.

### Inputs / Fields
- **Style:** 1px `Manila Rule` border, transparent background, no radius, 44px minimum height, 12px `Wire Ink` text, `Faded Wire Ink` placeholder. Label sits above the field: 11px/600/0.1em-tracked uppercase, JetBrains Mono, always visible (never placeholder-only).
- **Focus:** the global focus ring — 2px `Nominal Green` outline, 2px offset — same treatment as every other focusable element on the desk; inputs get no bespoke focus style.
- **Error:** a bordered, text-only `Alarm Muted` block beneath the field or form, never a red-bordered input — the error is announced as its own line, not by recoloring the field.

### Navigation
- **Wire Header (masthead):** the single persistent chrome element — nameplate ("POSTMORTEM", Orbitron), subtitle label ("INCIDENT WIRE", JetBrains Mono), and a live heartbeat cluster (Nominal-colored pulsing dot + "LIVE" + a real-time UTC wire clock in `HH:MM:SSZ` format) right-aligned, alongside the signed-in user's name/role and (admin-only) a "MANAGE USERS" link. Bottom border is the system's one 4px double rule. There is no nav menu, no tabs, no secondary chrome — the header is a masthead, not a navigation bar. The admin directory and login screen repeat the same masthead treatment (nameplate + subtitle) as their own header, keeping one visual anchor across every top-level screen.

### Precedence Stamp (signature component)
The severity vocabulary made visible: FLASH / URGENT / BULLETIN / ROUTINE, set in JetBrains Mono, escalating in weight/size/tracking as severity rises, and never colored. This is the component that carries the "typography over color-coding" thesis for the whole system.

### Mitigation Readout / Conflict Notice (signature components)
Two distinct alarm-family patterns, both spending the reserved `Alarm Red`. **Mitigation Readout — Active:** a quiet 1px-bordered row — summary text plus a right-aligned, tabular-numeral "EXPIRES MM:SS" countdown recomputed every second against the live clock (read-time truth, not a cached push). **Mitigation Readout — Expired:** the row becomes a solid `Alarm Red` block with `Alarm Ink` text reading "MITIGATION EXPIRED [time] AGO — UNWIND REQUIRED." **Conflict Notice:** the same solid `Alarm Red` fill and `Alarm Ink` text pattern, used when a concurrent edit is detected (a stale `version` on submit) — the alarm treatment generalizes beyond mitigation TTLs to any state that genuinely needs a human now. It replaces the panel's normal action row entirely rather than stacking beside it — a conflict blocks further action until it's resolved by reloading.

### Slide-Over Panel (signature pattern)
The incident detail view and the new-incident form share one shell: docked full-width at the bottom of the viewport on mobile, a fixed right-hand panel at `sm` and above, `Bright Manila` background against the page's `Manila Paper`, entering/exiting on a 300ms transform. Its content — header row, then body sections — mounts with the same staggered-spring choreography as the feed itself (see Motion below), so a freshly opened panel feels like it belongs to the same system as the list that opened it, not like a separate modal layer.

## Motion

The desk uses one shared entrance choreography, not per-component animation: a parent stagger (`staggerChildren: 0.06s`) wrapping children that individually rise from `opacity: 0, y: 16px` to their resting position on a spring (`stiffness: 120, damping: 20`). It drives the incident feed's row-by-row appearance, both slide-over panels' section-by-section reveal, and the admin directory's user list. It plays once per mount — a feed re-sort after a claim/resolve doesn't replay it, since rows stay mounted and just reflow — and the whole system is wrapped in `MotionConfig reducedMotion="user"`, so it disengages automatically for anyone with reduced-motion preferences set.

### Named Rules
**The One-Entrance Rule.** Every data-bearing surface that mounts — the feed, a slide-over panel, the admin directory — uses the same stagger-and-spring choreography, never a bespoke animation per surface. One motion vocabulary reused everywhere reads as a system trait; a different animation per screen would read as decoration.

## Do's and Don'ts

### Do:
- **Do** keep Amber, Nominal, and Alarm each meaning exactly one thing — OPEN, "live and working," and "needs a human now," respectively (The Reserved-Signal Rule).
- **Do** communicate severity through the weight/size/tracking ladder (FLASH → ROUTINE), never through a color chip (The Precedence-By-Weight Rule).
- **Do** give every color token an explicit day value and an explicit night value tied to `prefers-color-scheme` — never derive dark mode by inverting light mode (The Day Desk / Night Desk Rule).
- **Do** keep every rectangular surface at 0 radius; the only permitted curve is the functional live-pulse dot (The Right-Angle Rule).
- **Do** limit Orbitron to the masthead nameplate and Chakra Petch to incident titles and panel headings; everything else runs in JetBrains Mono (The Two-Voice Rule).
- **Do** reuse the bordered segmented-control pattern (severity picker, role toggle, auth tabs) rather than inventing a new selector style per form.
- **Do** use the shared stagger-and-spring entrance for any new data-bearing surface, and respect `reducedMotion="user"` rather than hardcoding animation (The One-Entrance Rule).
- **Do** set `font-variant-numeric: tabular-nums` (or the `tnum` feature) on any live-updating numeral — clocks, countdowns, elapsed-time strings — so digits never jitter the layout.
- **Do** keep interactive targets at a minimum 44px height, per the product's ICU-grade accessibility commitment.

### Don't:
- **Don't** use Amber, Nominal Green, and Alarm Red interchangeably, or introduce a further general-purpose accent — the palette's force comes from each hue meaning exactly one thing.
- **Don't** give a form field a colored border to signal an error; errors are their own text-only `Alarm Muted` line, never a recolored input.
- **Don't** add `box-shadow` or simulated elevation anywhere; depth is stroke weight, tint delta, and (for panels) a lighter paper tone — never a shadow.
- **Don't** round a button, card, divider, or form field; radius is spent entirely on the pulse-dot indicators.
- **Don't** spread either display typeface beyond its one reserved job — Orbitron is not a general headline face, and Chakra Petch is not a body or label face.
- **Don't** turn "claimed" into a toggle a responder can undo casually — claiming is a stamp, a one-way mark, matching the audit trail's append-only discipline.
</content>
