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
  alarm: "#a3271a"
  alarm-ink: "#faf5e8"
typography:
  display:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "clamp(1.875rem, 1.6rem + 1vw, 2.25rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "normal"
  title:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
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
---

# Design System: PostMortem

## Overview

**Creative North Star: "The Incident Wire"**

PostMortem's dashboard is not a status-card grid — it's a continuous wire feed, the same discipline a newsroom telex applies to incoming copy: timestamped, precedence-graded, append-only, never silently edited. This is a deliberate refusal of the generic-SaaS dashboard default (colored status pills in a card grid); the system's own THESIS is that the audit-trail discipline the product is built on — nothing is silently overwritten, every action punches a new line — deserves a visual form that behaves the same way. The page reads top-down like dispatch copy, most urgent and most recent first, not as a dashboard the eye has to hunt across.

The palette is near-monochrome by design: warm manila paper and dark ink by day, gunmetal ground and amber ink by night — the same machine under a different light source, not an inverted theme. Against that neutral field sit two reserved signal-lamp colors, not one general-purpose accent: a nominal green for "still live, working as expected" (the pulse dot, an in-progress status tag), and an alarm red held back strictly for what actually needs a human now (an expired mitigation, a version conflict, a failed feed load). The two never trade places — normal and urgent are never the same hue, which is exactly why either reads instantly when it appears. Severity itself never touches color at all — FLASH/URGENT/BULLETIN/ROUTINE is a typographic ladder of weight and size, the wire service's own precedence vocabulary. Every surface is flat: no shadows, no rounded corners anywhere except the two functional live-pulse dots. Component feel is restrained and exacting — every stroke deliberate, nothing decorative, nothing added for warmth that isn't earned by function.

**Key Characteristics:**
- Continuous append-only feed, not a card grid — one bulletin per incident, dividers not gutters.
- Near-monochrome manila/gunmetal palette with two reserved signal-lamp colors: nominal green, alarm red — never the same hue for "normal" and "urgent."
- Severity communicated by typography (weight, size, tracking), never by color.
- Zero shadows, zero border-radius except the two functional pulse dots.
- Day desk / night desk: light and dark are two lighting conditions on one machine, not an inversion.

## Colors

Near-monochrome by design — every color decision defends the rule that a hue only ever means one thing: nominal or alarm, never both.

### Primary
- **Nominal Green** (`#2f6b3a` day / `#43c463` night): the "still live, working as expected" signal. Drives the header's LIVE pulse dot and the status tag for an open/in-progress incident, plus the focus ring and text-selection color. It is a signal of normal operation, not an alert — its presence means the wire is working, not that something is wrong.
- **Alarm Red** (`#a3271a` day / `#ff4d3d` night): reserved strictly for genuine alarm states — the expired-mitigation banner and the version-conflict notice. Never used for a routine "live" state or for decoration; its rarity is what makes it legible as "act now" the instant it appears.
- **Alarm Ink** (`#faf5e8` day / `#17181a` night): the text/border color that sits on top of an Alarm Red fill (the expired-mitigation banner and conflict-notice text, and the inverse on their hover/focus state).

### Neutral
- **Manila Paper** (`#f2ead7` day / `#17181a` night): the page ground. Warm parchment under office light; near-black gunmetal under a night desk lamp.
- **Aged Manila** (`#e7dcc2` day / `#202225` night): the hover tint on a bulletin row — a shade darker than the page, never a shadow.
- **Bright Manila** (`#faf5e8` day / `#1e2023` night): a lighter/raised paper value defined in the token set for an elevated surface; not consumed by a shipped surface today (it is reused as `alarm-ink`'s day value, but that is a coincidence of the palette, not a raised-surface usage).
- **Wire Ink** (`#211d14` day / `#e9dab5` night): primary text. Near-black on paper by day; warm amber on gunmetal by night.
- **Faded Wire Ink** (`#5c5340` day / `#a3906a` night): secondary/meta text — reporter lines, timestamps, dim labels, and a resolved status tag.
- **Gunmetal** (`#2c3134` day / `#d7dade` night): a separate cool gray-blue family reserved for the masthead's double-rule border only — the header's structural chrome, distinct from the warm paper/ink family it sits above.
- **Dim Gunmetal** (`#6b7176` day / `#8d9297` night): scrollbar chrome only.
- **Manila Rule** (`#c9bb98` day / `#3a3d40` night): the hairline divider between bulletins and the border around a claim button or active mitigation readout.

### Named Rules
**The Two-Lamp Rule.** Nominal and Alarm are two distinct, reserved signals, not one accent doing double duty. Nominal green means "live and working as expected" (the pulse dot, an open status tag, focus rings). Alarm red means "this needs a human now" (an expired mitigation, a version conflict). Neither ever stands in for the other — a state that is merely ongoing is never colored red, and a state that has actually gone wrong is never colored green.

**The Day Desk / Night Desk Rule.** Light and dark mode are not an inverted palette — they're two lighting conditions on the same machine (`prefers-color-scheme`, not a manual toggle). Every neutral and both signal colors get an explicit day value and an explicit night value; neither is derived by inverting the other.

## Typography

**Display Font:** Big Shoulders Display (weights 700/800, self-hosted via `@fontsource/big-shoulders-display`), with JetBrains Mono / Arial Narrow / sans-serif fallback
**Body/Mono Font:** JetBrains Mono (with ui-monospace, SFMono-Regular, Menlo, Consolas, monospace fallback)

**Character:** A condensed display face doing one narrow job, and a monospace workhorse doing everything else. Big Shoulders Display — tall, condensed, headline-weight — is spent only on the masthead nameplate and the two incident-title headings: the moments where the wire needs a genuine typographic voice. Everything else on the desk — precedence stamps, claimed-badge text, audit-trail action labels, the mitigation countdown, empty/error-state headings, the "— 30 —" sign-off — runs in JetBrains Mono, the machine's own instrumentation face, with no special treatment. `font-feature-settings: "tnum" 1` is set globally so every live-updating numeral (clock, elapsed time, countdown) holds a fixed width and never jitters the layout as digits change.

### Hierarchy
- **Display** (800, `text-3xl`→`text-4xl` / 30px→36px, tight tracking, uppercase): the "POSTMORTEM" masthead nameplate. Appears exactly once, in the header.
- **Headline** (700, `text-xl`→`text-2xl` / 20px→24px): an incident's title, in both the bulletin row and the detail panel. The only other place Big Shoulders Display appears.
- **Title / Precedence** (500–700 depending on severity, 12px–15px, 0.06–0.08em tracking, JetBrains Mono): the precedence ladder itself — see the Named Rule below.
- **Body** (400, 12px–14px, JetBrains Mono): reporter lines, elapsed-time strings, mitigation summaries — the day-to-day meta copy of a bulletin.
- **Label** (600, 11px–12px, 0.1–0.2em tracking, uppercase, JetBrains Mono): the "INCIDENT WIRE" subtitle, the "LIVE" indicator, status tags, claim button, and the "ALL CLEAR" / "WIRE DOWN" state headings.

### Named Rules
**The One-Voice Display Rule.** Big Shoulders Display is spent on exactly two things: the masthead nameplate and an incident's title (bulletin row and detail panel). Every other element on the desk — stamps, badges, audit labels, countdowns, state headings, the sign-off — runs in JetBrains Mono. A display face used everywhere stops being a voice; PostMortem keeps it rare on purpose.

**The Precedence-By-Weight Rule.** Severity is FLASH / URGENT / BULLETIN / ROUTINE — words, never a color chip — and each step down the ladder loses weight, size, and tracking in the same motion: FLASH is 15px/bold/0.08em, ROUTINE is 12px/medium/0.06em and dimmed to `ink-dim`. A reader triages by glancing at type density alone.

## Layout

A single continuous column, never a multi-column grid. Content is constrained to a `max-w-4xl` (896px) reading column, centered, with horizontal padding of 20px at the base breakpoint widening to 32px at the 640px (`sm`) breakpoint — the only responsive change in the whole layout is that padding and two font sizes step up; the structure itself never reflows into columns or cards. Vertical rhythm: 16px vertical padding per bulletin row, 24px around the feed's closing "— 30 —" mark, 64–80px for the loading and empty states. Rows are separated by hairline dividers, not gutters or card shadows — the feed is one unbroken sheet of wire copy, and the "— 30 —" sign-off (the wire-service convention for "end of story") marks its bottom rather than a load-more control.

## Elevation & Depth

Flat, with zero exceptions. There is no `box-shadow` anywhere in the codebase. Depth is conveyed entirely by stroke weight and background-tint delta: a 1px hairline (`Manila Rule`) divides ordinary rows, a 4px **double** rule (`Gunmetal`) marks the masthead as structurally separate from the feed beneath it, and a hover state on a bulletin row is a flat tint shift to `Aged Manila`, never a lift or a shadow. Both the expired-mitigation alarm and the version-conflict notice are solid fills, not elevated cards — urgency is announced by color and weight, never by simulated height.

### Named Rules
**The Flat Wire Rule.** No shadow, ever. If something needs to feel more important, it gets a heavier border or one of the two reserved signal colors — never a drop shadow pretending the screen has depth it doesn't.

## Shapes

Every rectangular surface — buttons, dividers, the mitigation readout, the alarm and conflict blocks — sits at 0 radius. The only curves in the entire system are the live-pulse status dots (in the header's "LIVE" indicator and a bulletin's status tag), and those are functional signal chrome, not decoration. Containment is expressed through border strokes at three weights: 1px hairline for dividers and the claim button's outline, 4px double-rule for the masthead, and a solid fill (no border at all) for the alarm-state blocks.

### Named Rules
**The Right-Angle Rule.** Radius is reserved for exactly one thing: the circular pulse indicator that means "this is live." Every other shape in the system is a hard rectangle.

## Components

Restrained and exacting — every component behaves like dispatch-desk equipment (stamp, claim, log), not like a persuasive UI trying to be liked.

### Buttons
- **Shape:** hard rectangle, 0 radius, 1px `Wire Ink` outline, no fill at rest.
- **Claim (primary action):** transparent background, `Wire Ink` text and border, min-height 44px (the accessibility touch-target floor), 16px horizontal padding, 12px/600/0.1em-tracked uppercase label, JetBrains Mono.
- **Hover / Focus:** the entire button inverts — fill becomes `Wire Ink`, text becomes `Manila Paper` — on both `:hover` and `:focus-visible`, so keyboard and pointer users get an identical, unambiguous confirmation.
- **Claimed state (not a button):** once claimed, the control becomes a static stamp — 1px `Manila Rule` border, `Faded Wire Ink` text, "CLAIMED — [NAME]" — a permanent mark rather than a toggle, matching the product's claim-as-stamp story. Set in JetBrains Mono, not the display face.

### Chips
- **Status Tag — where the Nominal signal lives.** A live/open state renders in `Nominal Green` with a pulsing dot; `RESOLVED` renders in flat `Faded Wire Ink` with no dot. No background fill, no border — the chip is text and, when live, one small animated dot.

### Cards / Containers
- **Incident Bulletin (the feed row):** no card shell — a 1px `Manila Rule` bottom border is the only boundary, full-bleed against the page background. Resolved incidents drop to 70% opacity rather than changing color, keeping severity and status legible through weight, not just through fading.
- **Background:** `Manila Paper`; hover shifts the row to `Aged Manila` at 60% opacity.
- **Shadow Strategy:** none — see Elevation & Depth.
- **Internal Padding:** 16px vertical, 20px→32px horizontal (matches Layout).

### Navigation
- **Wire Header (masthead):** the single persistent chrome element — nameplate ("POSTMORTEM", Big Shoulders Display), subtitle label ("INCIDENT WIRE"), and a live heartbeat cluster (Nominal-colored pulsing dot + "LIVE" + a real-time UTC wire clock in `HH:MM:SSZ` format) right-aligned. Bottom border is the system's one 4px double rule. There is no nav menu, no tabs, no secondary chrome — the header is a masthead, not a navigation bar.

### Precedence Stamp (signature component)
The severity vocabulary made visible: FLASH / URGENT / BULLETIN / ROUTINE, set in JetBrains Mono, escalating in weight/size/tracking as severity rises, and never colored. This is the component that carries the "typography over color-coding" thesis for the whole system.

### Mitigation Readout / Conflict Notice (signature components)
Two distinct alarm-family patterns, both spending the reserved `Alarm Red`. **Mitigation Readout — Active:** a quiet 1px-bordered row — summary text plus a right-aligned, tabular-numeral "EXPIRES MM:SS" countdown recomputed every second against the live clock (read-time truth, not a cached push). **Mitigation Readout — Expired:** the row becomes a solid `Alarm Red` block with `Alarm Ink` text reading "MITIGATION EXPIRED [time] AGO — UNWIND REQUIRED." **Conflict Notice:** the same solid `Alarm Red` fill and `Alarm Ink` text pattern, used when a concurrent edit is detected — the alarm treatment generalizes beyond mitigation TTLs to any state that genuinely needs a human now.

## Do's and Don'ts

### Do:
- **Do** reserve `Nominal Green` for "still live, working as expected" states only — the LIVE pulse, an open status tag, focus rings — and `Alarm Red` for genuine alarm states only — an expired mitigation, a version conflict (The Two-Lamp Rule).
- **Do** communicate severity through the weight/size/tracking ladder (FLASH → ROUTINE), never through a color chip (The Precedence-By-Weight Rule).
- **Do** give every color token an explicit day value and an explicit night value tied to `prefers-color-scheme` — never derive dark mode by inverting light mode (The Day Desk / Night Desk Rule).
- **Do** keep every rectangular surface at 0 radius; the only permitted curve is the functional live-pulse dot (The Right-Angle Rule).
- **Do** limit Big Shoulders Display to the masthead nameplate and incident titles; everything else runs in JetBrains Mono (The One-Voice Display Rule).
- **Do** set `font-variant-numeric: tabular-nums` (or the `tnum` feature) on any live-updating numeral — clocks, countdowns, elapsed-time strings — so digits never jitter the layout.
- **Do** keep interactive targets at a minimum 44px height, per the product's ICU-grade accessibility commitment.

### Don't:
- **Don't** use Nominal Green and Alarm Red interchangeably, or introduce a third general-purpose accent — the palette's force comes from two hues each meaning exactly one thing (The Two-Lamp Rule).
- **Don't** add `box-shadow` or simulated elevation anywhere; depth is stroke weight and tint delta only.
- **Don't** round a button, card, or divider; radius is spent entirely on the pulse-dot indicators.
- **Don't** spread the display typeface (Big Shoulders Display) beyond the masthead and incident titles — it is not a general headline face for stamps, badges, or state messages, even though its condensed weight makes it tempting for emphasis.
- **Don't** turn "claimed" into a toggle a responder can undo casually — claiming is a stamp, a one-way mark, matching the audit trail's append-only discipline.
</content>
