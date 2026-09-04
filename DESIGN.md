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
  accent: "#b93318"
  accent-ink: "#faf5e8"
  accent-dim: "#8c6a4a"
typography:
  display:
    fontFamily: "Courier Prime, JetBrains Mono, ui-monospace, monospace"
    fontSize: "clamp(1.5rem, 1.2rem + 1.2vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Courier Prime, JetBrains Mono, ui-monospace, monospace"
    fontSize: "clamp(1rem, 0.95rem + 0.2vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "normal"
  title:
    fontFamily: "Courier Prime, JetBrains Mono, ui-monospace, monospace"
    fontSize: "clamp(0.75rem, 0.72rem + 0.1vw, 0.9375rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
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
    letterSpacing: "0.15em"
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
  button-claim-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  status-tag-live:
    textColor: "{colors.accent}"
    typography: "{typography.label}"
  status-tag-resolved:
    textColor: "{colors.ink-dim}"
    typography: "{typography.label}"
  mitigation-readout-expired:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-ink}"
    padding: "6px 10px"
---

# Design System: PostMortem

## Overview

**Creative North Star: "The Incident Wire"**

PostMortem's dashboard is not a status-card grid — it's a continuous wire feed, the same discipline a newsroom telex applies to incoming copy: timestamped, precedence-graded, append-only, never silently edited. This is a deliberate refusal of the generic-SaaS dashboard default (colored status pills in a card grid); the system's own THESIS is that the audit-trail discipline the product is built on — nothing is silently overwritten, every action punches a new line — deserves a visual form that behaves the same way. The page reads top-down like dispatch copy, most urgent and most recent first, not as a dashboard the eye has to hunt across.

The palette is near-monochrome by design: warm manila paper and dark ink by day, gunmetal ground and amber ink by night — the same machine under a different light source, not an inverted theme. A single hot accent, Wire Red, is spent almost nowhere, which is exactly why it reads instantly when it appears: the live/unresolved state, and the alarm when a mitigation's TTL has run out. Severity itself never touches color at all — FLASH/URGENT/BULLETIN/ROUTINE is a typographic ladder of weight and size, the wire service's own precedence vocabulary. Every surface is flat: no shadows, no rounded corners anywhere except the two functional live-pulse dots. Component feel is restrained and exacting — every stroke deliberate, nothing decorative, nothing added for warmth that isn't earned by function.

**Key Characteristics:**
- Continuous append-only feed, not a card grid — one bulletin per incident, dividers not gutters.
- Near-monochrome manila/gunmetal palette with exactly one reserved hot accent.
- Severity communicated by typography (weight, size, tracking), never by color.
- Zero shadows, zero border-radius except the two functional pulse dots.
- Day desk / night desk: light and dark are two lighting conditions on one machine, not an inversion.

## Colors

Near-monochrome by design — every color decision defends the rule that only one hue is allowed to mean "urgent."

### Primary
- **Wire Red** (`#b93318` day / `#ff6136` night): the system's only hot color. Reserved for the live/unresolved status dot and label, and the expired-mitigation alarm block. Never used for severity, hover states, or decoration — its rarity is what makes it legible at a glance.

### Neutral
- **Manila Paper** (`#f2ead7` day / `#17181a` night): the page ground. Warm parchment under office light; near-black gunmetal under a night desk lamp.
- **Aged Manila** (`#e7dcc2` day / `#202225` night): the hover tint on a bulletin row — a shade darker than the page, never a shadow.
- **Bright Manila** (`#faf5e8` day / `#1e2023` night): a lighter/raised paper value defined in the token set for a future elevated surface; not yet consumed by a shipped component.
- **Wire Ink** (`#211d14` day / `#e9dab5` night): primary text. Near-black on paper by day; warm amber on gunmetal by night.
- **Faded Wire Ink** (`#5c5340` day / `#a3906a` night): secondary/meta text — reporter lines, timestamps, dim labels.
- **Gunmetal** (`#2c3134` day / `#d7dade` night): a separate cool gray-blue family reserved for the masthead's double-rule border only — the header's structural chrome, distinct from the warm paper/ink family it sits above.
- **Dim Gunmetal** (`#6b7176` day / `#8d9297` night): scrollbar chrome only.
- **Manila Rule** (`#c9bb98` day / `#3a3d40` night): the hairline divider between bulletins and the border around a claim button or mitigation readout.
- **Wire Red Ink** (`#faf5e8` day / `#17181a` night): the ink that sits on top of a Wire Red field (the expired-mitigation banner text).
- **Ember** (`#8c6a4a` day / `#a3653f` night): a muted variant of Wire Red, defined in the token set but not yet consumed by any shipped component — reserved for a future secondary-alert tier rather than deployed today.

### Named Rules
**The One Signal Rule.** Wire Red appears in exactly two places: the live/unresolved status indicator and the expired-mitigation alarm. It is never used for hover states, severity, or emphasis of any other kind — if everything can turn red, nothing does.

**The Day Desk / Night Desk Rule.** Light and dark mode are not an inverted palette — they're two lighting conditions on the same machine (`prefers-color-scheme`, not a manual toggle). Every neutral and the accent both get an explicit day value and an explicit night value; neither is derived by inverting the other.

## Typography

**Display/Wire Font:** Courier Prime (with JetBrains Mono, ui-monospace, monospace fallback)
**Body/Mono Font:** JetBrains Mono (with ui-monospace, SFMono-Regular, Menlo, Consolas, monospace fallback)

**Character:** Two monospace families doing two different jobs. Courier Prime — an actual typewriter/telex face — carries the masthead, bulletin headlines, precedence stamps, and claim labels: anything that reads as *the wire itself speaking*. JetBrains Mono carries everything procedural: timestamps, meta lines, body copy, status labels — the machine's own instrumentation. `font-feature-settings: "tnum" 1` is set globally so every live-updating numeral (clock, elapsed time, countdown) holds a fixed width and never jitters the layout as digits change.

### Hierarchy
- **Display** (700, `text-2xl`→`text-3xl` / 24px→30px, tight tracking): the "POSTMORTEM" masthead nameplate. Appears exactly once, in the header.
- **Headline** (400, `text-base`→`text-lg` / 16px→18px): a bulletin's incident title. Deliberately not bold — weight is reserved for precedence, not for every headline.
- **Title / Precedence** (500–700 depending on severity, 12px–15px, 0.06–0.08em tracking): the precedence ladder itself — see the Named Rule below.
- **Body** (400, 12px–14px): reporter lines, elapsed-time strings, mitigation summaries — the day-to-day meta copy of a bulletin.
- **Label** (600, 11px–12px, 0.1–0.2em tracking, uppercase): the "INCIDENT WIRE" subtitle, the "LIVE" indicator, status tags, and the claim button — short, tracked-out, always-caps micro-labels.

### Named Rules
**The Precedence-By-Weight Rule.** Severity is FLASH / URGENT / BULLETIN / ROUTINE — words, never a color chip — and each step down the ladder loses weight, size, and tracking in the same motion: FLASH is 15px/bold/0.08em, ROUTINE is 12px/medium/0.06em and dimmed to `ink-dim`. A reader triages by glancing at type density alone.

## Layout

A single continuous column, never a multi-column grid. Content is constrained to a `max-w-4xl` (896px) reading column, centered, with horizontal padding of 20px at the base breakpoint widening to 32px at the 640px (`sm`) breakpoint — the only responsive change in the whole layout is that padding and two font sizes step up; the structure itself never reflows into columns or cards. Vertical rhythm: 16px vertical padding per bulletin row, 24px around the feed's closing "— 30 —" mark, 64–80px for the loading and empty states. Rows are separated by hairline dividers, not gutters or card shadows — the feed is one unbroken sheet of wire copy, and the "— 30 —" sign-off (the wire-service convention for "end of story") marks its bottom rather than a load-more control.

## Elevation & Depth

Flat, with zero exceptions. There is no `box-shadow` anywhere in the codebase. Depth is conveyed entirely by stroke weight and background-tint delta: a 1px hairline (`Manila Rule`) divides ordinary rows, a 4px **double** rule (`Gunmetal`) marks the masthead as structurally separate from the feed beneath it, and a hover state on a bulletin row is a flat tint shift to `Aged Manila`, never a lift or a shadow. The expired-mitigation alarm is a solid fill, not an elevated card — urgency is announced by color and weight, never by simulated height.

### Named Rules
**The Flat Wire Rule.** No shadow, ever. If something needs to feel more important, it gets a heavier border or the one reserved accent color — never a drop shadow pretending the screen has depth it doesn't.

## Shapes

Every rectangular surface — buttons, dividers, the mitigation readout, the alarm block — sits at 0 radius. The only curves in the entire system are the two live-pulse status dots (in the header's "LIVE" indicator and a bulletin's "MITIGATED"/"OPEN" status tag), and those are functional signal chrome, not decoration. Containment is expressed through border strokes at three weights: 1px hairline for dividers and the claim button's outline, 4px double-rule for the masthead, and a solid fill (no border at all) for the expired-mitigation alarm.

### Named Rules
**The Right-Angle Rule.** Radius is reserved for exactly one thing: the circular pulse indicator that means "this is live." Every other shape in the system is a hard rectangle.

## Components

Restrained and exacting — every component behaves like dispatch-desk equipment (stamp, claim, log), not like a persuasive UI trying to be liked.

### Buttons
- **Shape:** hard rectangle, 0 radius, 1px `Wire Ink` outline, no fill at rest.
- **Claim (primary action):** transparent background, `Wire Ink` text and border, min-height 44px (the accessibility touch-target floor), 16px horizontal padding, 12px/600/0.1em-tracked uppercase label.
- **Hover / Focus:** the entire button inverts — fill becomes `Wire Ink`, text becomes `Manila Paper` — on both `:hover` and `:focus-visible`, so keyboard and pointer users get an identical, unambiguous confirmation.
- **Claimed state (not a button):** once claimed, the control becomes a static stamp — 1px `Manila Rule` border, `Faded Wire Ink` text, "CLAIMED — [NAME]" — a permanent mark rather than a toggle, matching the product's claim-as-stamp story.

### Chips
- **Status Tag — the only place color signals urgency.** Live states (`OPEN`, `MITIGATED`) render in `Wire Red` with a pulsing dot; `RESOLVED` renders in flat `Faded Wire Ink` with no dot. No background fill, no border — the chip is text and, when live, one small animated dot.

### Cards / Containers
- **Incident Bulletin (the feed row):** no card shell — a 1px `Manila Rule` bottom border is the only boundary, full-bleed against the page background. Resolved incidents drop to 70% opacity rather than changing color, keeping severity and status legible through weight, not just through fading.
- **Background:** `Manila Paper`; hover shifts the row to `Aged Manila` at 60% opacity.
- **Shadow Strategy:** none — see Elevation & Depth.
- **Internal Padding:** 16px vertical, 20px→32px horizontal (matches Layout).

### Navigation
- **Wire Header (masthead):** the single persistent chrome element — nameplate ("POSTMORTEM"), subtitle label ("INCIDENT WIRE"), and a live heartbeat cluster (pulsing dot + "LIVE" + a real-time UTC wire clock in `HH:MM:SSZ` format) right-aligned. Bottom border is the system's one 4px double rule. There is no nav menu, no tabs, no secondary chrome — the header is a masthead, not a navigation bar.

### Precedence Stamp (signature component)
The severity vocabulary made visible: FLASH / URGENT / BULLETIN / ROUTINE, set in the wire typeface, escalating in weight/size/tracking as severity rises, and never colored. This is the component that carries the "typography over color-coding" thesis for the whole system.

### Mitigation Readout (signature component)
Two states with deliberately different visual weight. **Active:** a quiet 1px-bordered row — summary text plus a right-aligned, tabular-numeral "EXPIRES MM:SS" countdown recomputed every second against the live clock (read-time truth, not a cached push). **Expired:** the row becomes a solid `Wire Red` alarm block with `Wire Red Ink` text reading "MITIGATION EXPIRED [time] AGO — UNWIND REQUIRED" — the one place besides the live-status dot where the reserved accent is spent.

## Do's and Don'ts

### Do:
- **Do** reserve `Wire Red` exclusively for the live/unresolved status signal and the expired-mitigation alarm — nowhere else (The One Signal Rule).
- **Do** communicate severity through the Courier Prime weight/size/tracking ladder (FLASH → ROUTINE), never through a color chip (The Precedence-By-Weight Rule).
- **Do** give every color token an explicit day value and an explicit night value tied to `prefers-color-scheme` — never derive dark mode by inverting light mode (The Day Desk / Night Desk Rule).
- **Do** keep every rectangular surface at 0 radius; the only permitted curve is the functional live-pulse dot (The Right-Angle Rule).
- **Do** set `font-variant-numeric: tabular-nums` (or the `tnum` feature) on any live-updating numeral — clocks, countdowns, elapsed-time strings — so digits never jitter the layout.
- **Do** keep interactive targets at a minimum 44px height, per the product's ICU-grade accessibility commitment.

### Don't:
- **Don't** add a second accent hue, a gradient, or a tinted shadow — the palette's entire force comes from staying near-monochrome with one reserved color (The Flat Wire Rule, The One Signal Rule).
- **Don't** add `box-shadow` or simulated elevation anywhere; depth is stroke weight and tint delta only.
- **Don't** round a button, card, or divider; radius is spent entirely on the two pulse-dot indicators.
- **Don't** use the wire typeface (Courier Prime) for dense body or meta copy — it's reserved for the masthead, bulletin headlines, precedence stamps, and short control labels; long-running text stays in JetBrains Mono.
- **Don't** turn "claimed" into a toggle a responder can undo casually — claiming is a stamp, a one-way mark, matching the audit trail's append-only discipline.
