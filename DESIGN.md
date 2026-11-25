---
name: Erik Hernal, GTM Engineer
description: A bound engineering notebook where the first number gets struck out in ink and the corrected one is written beside it in red.
colors:
  paper: "#f3f5ef"
  desk: "#dfe3da"
  slip: "#fffdf6"
  ink: "#1c2752"
  ink-soft: "#44507a"
  pencil: "#6d7280"
  red: "#c03f13"
  grid: "rgba(28, 39, 82, 0.06)"
  grid-major: "rgba(28, 39, 82, 0.1)"
  grid-strong: "#b5c7d8"
  ink-wash: "rgba(28, 39, 82, 0.14)"
  tape: "rgba(236, 226, 190, 0.78)"
typography:
  display:
    fontFamily: "Source Serif 4 Variable, Georgia, Times New Roman, serif"
    fontSize: "clamp(34px, 5vw, 64px)"
    fontWeight: 420
    lineHeight: 1.06
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Source Serif 4 Variable, Georgia, Times New Roman, serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Source Serif 4 Variable, Georgia, Times New Roman, serif"
    fontSize: "22px"
    fontWeight: 600
    lineHeight: 1.2
  body:
    fontFamily: "Source Serif 4 Variable, Georgia, Times New Roman, serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.55
  lede:
    fontFamily: "Source Serif 4 Variable, Georgia, Times New Roman, serif"
    fontSize: "21px"
    fontWeight: 400
    lineHeight: 1.55
  figure-now:
    fontFamily: "Source Serif 4 Variable, Georgia, Times New Roman, serif"
    fontSize: "96px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  figure-was:
    fontFamily: "Source Serif 4 Variable, Georgia, Times New Roman, serif"
    fontSize: "64px"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "tnum"
  label:
    fontFamily: "Archivo Narrow Variable, Arial Narrow, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.08em"
  action:
    fontFamily: "Archivo Narrow Variable, Arial Narrow, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "0.06em"
  slip-text:
    fontFamily: "Archivo Narrow Variable, Arial Narrow, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
  hand:
    fontFamily: "Nanum Pen Script, Bradley Hand, cursive"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: 1.1
  machine:
    fontFamily: "ui-monospace, SF Mono, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  none: "0px"
  hole: "50%"
spacing:
  sm: "16px"
  grid: "24px"
  block: "48px"
  gap: "72px"
  entry: "96px"
  section: "120px"
components:
  page-sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.none}"
    padding: "0 64px 96px 168px"
    width: "1240px"
  form-field:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    padding: "22px 16px 10px"
  form-value:
    textColor: "{colors.ink}"
    typography: "{typography.hand}"
  index-link:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    padding: "7px 0 7px 12px"
  index-link-hover:
    textColor: "{colors.ink}"
  action-link:
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    padding: "0 0 6px"
  slip:
    backgroundColor: "{colors.slip}"
    textColor: "{colors.ink}"
    typography: "{typography.slip-text}"
    rounded: "{rounded.none}"
    padding: "20px 22px 18px"
  figure-was:
    textColor: "{colors.ink-soft}"
    typography: "{typography.figure-was}"
  figure-now:
    textColor: "{colors.red}"
    typography: "{typography.figure-now}"
  fast-note:
    textColor: "{colors.ink}"
    typography: "{typography.hand}"
---

# Design System: Erik Hernal, GTM Engineer

## Overview

**Creative North Star: "The Corrected Notebook"**

Every page is a sheet torn from one bound engineering notebook, laid on a grey-green desk. It has pale quad-ruled paper, a red margin rule and three punched binder holes, and the text is blue-black ballpoint. The work reads as dated entries. Each entry's first reported number is struck through with a pen stroke and the corrected figure sits beside it in red, so the honest correction is the loudest thing on the page.

The notebook keeps printed marks, written entries and handwriting apart. Printed matter (the form strip, labels, buttons, table heads) is a narrow grotesque in uppercase, while entries are written in a text serif.

Handwriting (page numbers, margin notes, the "fast version" line, the signature) is a pen script, and it shows up only where a person would have written by hand. Evidence is taped in on cream paper slips, set at a slight angle with two strips of masking tape.

The pages are calm and dense in the way a working notebook is. There's lots of paper, the measure stays readable, and decoration comes only from the notebook's own materials. There are no gradients beyond the ruled grid, no rounded cards, no icons, and no photography beyond the evidence itself.

**Key Characteristics:**

- One sheet of quad-ruled paper per page, with a 24px minor grid and a 120px major grid.
- Blue-black ink for all text. One red is kept for corrections, and it also marks page refs and the margin rule.
- A hand-drawn ink strike that draws itself across each first-reported number.
- Printed form strip across the top of every page, with handwritten values.
- Evidence on tilted, taped paper slips.
- A left-margin index and margin dates at desktop, which fold into a sticky top bar on phones.

## Colors

Cool paper, blue-black ink and a single warm red. Everything except the red sits in the same blue hue family as the ink.

### Primary
- **Ballpoint Ink** (ink): every heading, body line, link and action, plus the strike stroke and the 2px rules under section heads and the form strip. It's the voice of the page.

### Secondary
- **Correction Red** (red): the corrected figure, its handwritten label on lead entries, every handwritten page ref, the margin rule down the sheet, and the outer ring of the focus state. It reaches 4.83:1 on paper, so it holds AA for text at every size it's used.

### Neutral
- **Faded Ink** (ink-soft): secondary text such as ledes, dates, labels, form field names, the struck first number and slip titles. It's the same pen, lighter, at 7.15:1 on paper.
- **Graphite** (pencil): the pencil tick beside visited entries and the hover underline in the index. It's a mark, never a text color.
- **Ruled Paper** (paper): the sheet itself, and the full background on phones.
- **Desk** (desk): the surface the sheet rests on at desktop, and the fill of the binder holes so they read as punched through.
- **Slip Cream** (slip): taped-in slips, screenshots and the skip link. It's a touch warmer and brighter than the sheet so the slips sit on top of it.
- **Grid Line** (grid) and **Major Grid Line** (grid-major): the quad ruling, drawn as translucent ink so it always matches the pen.
- **Rule Blue** (grid-strong): hairline row dividers in ruled lists and tables. It also draws the dotted rules inside slips and the dividers in the form strip.
- **Ink Wash** (ink-wash): text selection.
- **Masking Tape** (tape): the translucent strips that hold every slip and screenshot.

### Named Rules
**The One Red Rule.** Red marks a correction or a place in the notebook, nothing else. The corrected figure, its label, page refs and the margin rule may use it, and so may the focus ring. Everything else, from body text to links and headings, stays in ink.

**The Same Pen Rule.** Secondary text is faded ink, never grey. If a color isn't ink, faded ink, red, or a paper tone, it doesn't belong on the sheet.

## Typography

**Display Font:** Source Serif 4 Variable, with optical sizing on (fallback Georgia, Times New Roman)
**Body Font:** Source Serif 4 Variable (same face)
**Label Font:** Archivo Narrow Variable (fallback Arial Narrow, Arial)
**Hand Font:** Nanum Pen Script (fallback Bradley Hand, cursive)
**Machine Font:** the system monospace stack, for file names and raw file lines only

**Character:** a bookish serif does the writing, a condensed grotesque does the printing, and a quick ballpoint script does the scribbling. The three never trade jobs.

### Hierarchy
- **Display** (420, clamp from 34px to 64px, 1.06, -0.02em): the one H1 per page, held to about 19ch and balanced.
- **Headline** (600, 34px, 1.15): section heads like Record or What clients said, each sitting on a 2px ink rule. Entry titles use the same size at weight 420 so they read as written, not printed.
- **Title** (600, 22px, 1.2): sub-heads inside a section.
- **Body** (400, 18px, 1.55): entry text and prose, at measures of 58 to 64ch. It drops to 17px on phones.
- **Lede** (400, 21px, faded ink): the paragraph under an H1, held to 52ch.
- **Figures** (600, tabular numerals): the struck first number at 64px in faded ink, then the corrected number at 96px in red. Mini entries scale them to 24px and 34px.
- **Label** (500, 13px, 0.08em, uppercase): form field names, the index, dates and table heads.
- **Action** (700, 15px, 0.06em, uppercase): the underlined links that ask for something, like Email me or Resume, PDF.
- **Hand** (400, 22px to 44px): page refs, form values, the fast-version note at 28px, and the 44px signature line.
- **Machine** (400, 11.5px to 14px): file names and receipt method lines. It also sets excerpts copied from source files.

### Named Rules
**The Printed or Written Rule.** Pick the face by asking who made the mark. A printer's mark is Archivo Narrow in uppercase, the entry itself is the serif, and a margin scribble is the pen script. Never set a paragraph of body text in the pen face.

**The Tabular Figures Rule.** Every figure, table and receipt uses tabular numerals so corrected numbers line up with the ones they replace.

## Layout

The page is one sheet, up to 1240px wide, centered on the desk with 28px of desk showing above and below, and a soft paper shadow. A 2px red margin rule runs the full height at 144px from the left edge. Three binder holes sit at 34px from the left. Content runs from 168px to 1176px, so both edges land on the 24px grid.

The left margin is working space. The index (Entries, Record, Clients, Resume, Contact) sits there as a narrow column, and each entry's date and page ref hang in the margin level with its title, right-aligned to the red rule. A printed form strip spans the top of every sheet in four cells (Name, Role, Notebook, Page), closed by a 2px ink rule.

Vertical rhythm runs in multiples of the 24px grid: 16px between paragraphs, 48px between blocks and grid columns, 72px above the H1 and under the mini entries, 96px between entries and case sections, and 120px between home sections. A lead entry with evidence splits into the text and a 312px slip column with a 48px gap. The three smaller entries sit in three equal columns under a 2px ink rule. Case pages put the taped receipts in a 300px to 360px side column from 1100px up.

Breakpoints step the layout down. Mini entries go to one column under 1000px, and email and receipt pairs stack under 900px. At 720px and below the sheet fills the screen with no desk, the margin rule moves to 16px, the holes disappear, the form strip becomes a 2 by 2 grid, the index becomes a sticky bar along the top, margin dates move inline above their titles, and every slip straightens.

### Named Rules
**The Margin Is For Notes Rule.** Only the index, dates and page refs live left of the red rule. Content never crosses it.

## Elevation & Depth

Depth is physical, and there's little of it. The page is flat paper with three lifted layers. Slips rest on the sheet and tape holds them down, while the sheet itself rests on the desk. Shadows are soft and tinted with the ink's navy, never offset hard.

### Shadow Vocabulary
- **Sheet** (`box-shadow: 0 2px 3px rgba(20, 30, 60, 0.08), 0 18px 40px -18px rgba(20, 30, 60, 0.35)`): the page on the desk, at desktop only.
- **Slip** (`box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 10px 24px -14px rgba(20, 30, 60, 0.4)`): any taped-in slip. Screenshots use a slightly deeper version (12px 28px, 0.45).
- **Punched Hole** (`box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.18)`): the binder holes, filled with the desk color.
- **Focus Ring** (`outline: 2px solid ink` plus `box-shadow: 0 0 0 2px paper, 0 0 0 3px red`): keyboard focus everywhere.

### Named Rules
**The Three Layers Rule.** Sheet, slip, tape. Nothing else gets a shadow, and hover never lifts anything.

## Shapes

Corners are square. The sheet, the slips, the tape and the tables all have sharp edges, and the only circles are the binder holes. Rules do the structural work: 2px ink rules close the form strip and sit under section heads, 1px rule-blue hairlines divide rows, and dotted rule-blue lines divide rows inside slips.

Slips tilt between about -1.1 and 1.3 degrees, and each one is held by two 84px by 26px tape strips that rise 12px above its top edge at their own small angles. Quote slips vary their tilt and tape positions from slip to slip so the page doesn't look stamped. The strike is the one curved line on the page: a slightly rising ballpoint stroke made of overlapping passes, heavier near its start and again past its middle, running a little past the number on both ends.

## Components

### Action Links
The site's buttons are underlined words, printed in uppercase.
- **Shape:** no box and no fill, just a 2px ink underline 6px below the text.
- **Default:** ink text in the action style, set in a row with 16px by 28px gaps.
- **Hover / Focus:** the underline thickens to 3px on hover, and focus gets the shared ink and red ring.

### Text Links
- Ink text with a 1px faded-ink underline 3px below, thickening to 2px on hover. Entry titles drop the underline until hover.

### Form Strip
- Four cells divided by 1px rule-blue lines, with a 2px ink rule beneath. Field names are labels in faded ink, and each value is handwritten in the pen script at 30px (26px on phones). The Page cell carries the sheet's page number, or a word when there isn't one.

### Margin Index
- Uppercase labels in faded ink stacked in the left margin. Hover turns them ink with a 2px graphite underline. On phones they spread across a sticky paper bar with a 1px ink rule below.

### Entry
The signature unit of the system.
- **Lead entry:** serif title at weight 420, the date and a red page ref in the left margin, then the struck figure, a one-line summary at 58ch, and the fast-version note. With evidence, a slip column sits to the right.
- **Mini entry:** a 23px title, a small uppercase date with a red pen page ref, the struck figure at small size, a 16px faded summary, and a 24px fast note.
- **Next entry:** used at the foot of case pages, with a 28px title led by an uppercase Next: and the small struck figure.
- **Visited state:** a small graphite pencil tick drawn after the title of any entry already read.

### Struck Figure
- The first reported number in faded ink with the ink strike over it, then the corrected number in red at half again the size, then a short handwritten label in red. On mini entries the label drops to its own line in faded ink. Screen readers hear "first reported as" and "corrected to".
- **Motion:** when the figure scrolls 60% into view, the strike draws left to right over 450ms with an expo ease-out, each pass slightly delayed (30ms to 220ms) so it reads as one stroke. Hovering or focusing the entry draws it again. Reduced motion and print show it already drawn.

### Fast-Version Note
- One handwritten line in ink at 28px, held to 30ch. It's rotated -1.5 degrees and begins "fast version:". It's the 30-second version of the entry.

### Taped Slip
- Cream paper, 20px by 22px padding, the slip shadow, a small tilt and two tape strips. Its title is a 13px uppercase label in faded ink, and its contents use the 14px narrow face with dotted dividers. Screenshots use the same treatment with a narrow caption below. On phones slips straighten and the tape pulls in to the edges.

### Ruled Lists and Tables
- Rows sit on 1px rule-blue hairlines with 11px to 12px of vertical padding. Table heads are 12px uppercase labels on a 2px ink rule. On phones, rows reflow into two lines and the head is hidden visually but kept for screen readers.

### Signature Line
- The contact block opens with a 44px handwritten "Signed" line on a 2px ink rule, followed by the contact actions. It's where the visitor is asked to act.

## Do's and Don'ts

### Do:
- **Do** keep every text color to ink, faded ink, or red, with red only for corrections, page refs, the margin rule and focus.
- **Do** lead each case with the struck first number and the red corrected one, using the shared struck figure.
- **Do** put evidence on a taped slip with a small tilt (about 1 degree either way) and two tape strips.
- **Do** set printed labels and actions in uppercase Archivo Narrow with 0.06em to 0.08em tracking.
- **Do** space sections, entries and blocks in 24px multiples (48px, 72px, 96px, 120px).
- **Do** keep body measures between 52ch and 64ch.
- **Do** keep the strike drawn for reduced motion and in print.

### Don't:
- **Don't** set any text in graphite; it's 4.38:1 on paper and is for marks only.
- **Don't** round corners on the sheet, slips, tables or links.
- **Don't** add shadows beyond the sheet, slips and binder holes. Nothing lifts on hover either.
- **Don't** use the pen script for paragraphs, headings or anything a printer would have made.
- **Don't** add icons, logos, headshots or stock imagery; the notebook's own marks (ticks, strikes, tape) do that work.
- **Don't** fill buttons or put them in boxes; actions are underlined words.
- **Don't** let content cross the red margin rule at desktop.
