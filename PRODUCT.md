# Product

<!-- impeccable:product-schema 1 -->

Written 2026-11-25 from the dispatch brief and the plan it points to. The brief limits this build to one planned question for Erik (the direction pick), so the init interview did not run. Every line marked (inferred) comes from the brief or the two source sites, not from Erik's own answer.

## Platform

web

## Stack

Astro, static output, deployed on Vercel from the GitHub repo. Decided in the plan (pick 2) and not reopened.

## Users

A hiring manager or recruiter for a GTM Engineer role who opens the site from Erik's resume. They give it a minute or two, usually on a laptop between other tabs, sometimes on a phone from a LinkedIn message. (inferred from the brief: "A hiring manager opens this site from his resume.")

## Product Purpose

erikhernal.com is Erik Hernal's single portfolio. It replaces two older sites (erik.heyagentic.ai and gtm-codex.vercel.app). Success is a hiring manager who believes Erik can write the message and build the system that sends it, and who emails him or books a call.

## Positioning

Erik checks his own numbers in public. The case studies lead with the result that went wrong or got smaller (a reply rate that fell from 6.1 percent to zero, a loyalty count that fell by half), each with the receipts that prove it. Most GTM portfolios show only the up-and-to-the-right number.

## Operating Context

The reader compares several candidates. They want the role fit, the proof, and a way to reach him, fast. They may download the resume.

## Capabilities and Constraints

- Pages: home, four case studies, a resume PDF, a page on how the site and its receipts are made, 404.
- The public site never shows Erik's phone number.
- The public repo never names API keys, vendor key names, internal hosts or webhook addresses. The receipts probe lives in a private repo and writes a committed `receipts.json` snapshot here.
- Copy is written as Erik: no em dashes, contractions, no exclamation marks, no banned AI words. `pnpm lint:copy` enforces the floor.
- Every link resolves (`pnpm check:links`).

## Brand Commitments

- Name: Erik Hernal, GTM Engineer.
- Voice: plain, first person, says what went wrong, numbers with their source. Taken from the four erik-site case studies, which are the strongest writing on either old site.
- The old Warhammer theme of gtm-codex and the email-thread look of erik-site are evidence, not commitments: the plan picked "Merge both, new design".

## Evidence on Hand

- Four case studies with receipts (erik-site `src/content/work/`): last-mile, proof-run, reply-rate, wrong-number.
- Four short cold emails (erik-site `src/content/emails/`).
- Career facts from the resume source (role history, Cleverly, Lumos, Agentic).
- Five client video testimonials published on the Lumos YouTube channel on 2026-02-12, quoted word for word with a timestamp.
- A Clay workspace snapshot taken 2026-09-04.
- One screenshot: the Clay waterfall panel.
- Absences: no headshot, no logo, no client logos cleared for use. Don't invent any.

## Product Principles

1. Every number links to where it came from.
2. The work leads; the biography supports it.
3. Show the smaller, honest number before the flattering one.
4. One clear way to reach Erik on every page.

## Accessibility & Inclusion

WCAG AA contrast, keyboard reachable, readable at 390px without horizontal scroll. (inferred)
