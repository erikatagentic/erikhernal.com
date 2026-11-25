---
page: 4
struck:
  was: "13 of 28"
  now: "15 of 15"
  label: "answers that held up on an independent recheck"
fast: "28 answers, 13 provable. After the fix, 15 of 15."
title: "The first proof run looked great and was lying"
slug: "proof-run"
cohort: "AlphaForge P6"
date: 2026-08-23
one_line: "An email-guessing function looked right on the first proof run until an independent recheck showed most of its answers were unprovable guesses."
number:
  label: "answers that survived an independent recheck, before and after the fix"
  value: "13 of 28, then 15 of 15"
  source: "prompt6/guesser-build-receipts-20260823.md"
receipts:
  - file: "guesser-build-receipts-20260823.md"
    count: "36 test rows, 28 first-run answers, 13 of them provable"
    proves: "the first proof run was scored right and was lying about most of its answers"
  - file: "endpoint-test-receipts.md"
    count: "7 of 7 fail-closed checks passed"
    proves: "a guard built the same week fails loud instead of defaulting to clean when it can't read its own memory"
  - file: "guesser/manual-step/waterfall-panel.png"
    count: "5 screenshots"
    proves: "the native Waterfall column configuration as saved in Clay, the one step done by hand instead of the API"
links: []
---

## What I sent

Since October I've had a 68-column Clay table that turns a name and a company domain into a verified email, a winner picked from ten patterns, each one checked against a live mailbox. Every new list meant rebuilding the column mapping by hand.

This time I built it as a function instead of a table: three required inputs in, one verified email out, published live in Clay so it drops into anyone's workspace without touching my original columns. What went out to the cohort was that function, a Loom walking through how it works, and the write-up built around the same 36-row test I used to catch my own bug.

## The system

The validator I trust, Reoon, isn't one of Clay's 655 built-in actions, so the function reaches it with an HTTP call instead, the same way it would call any outside tool. Each pattern gets checked in the order it's most likely to be right: on 18,018 verified emails already in my database, first-initial-last covers 40 percent of real addresses, first.last another 26, first name alone another 20. Those three cover the overwhelming majority of what is guessable at all, so the waterfall tries them in that order and stops at the first one a live mailbox check actually confirms.

<figure class="shot">
  <img src="/images/clay-waterfall.jpg" width="1000" height="588" loading="lazy" decoding="async" alt="The Custom Waterfall configuration panel open in Clay, with the provider sequence and run settings visible beside the table." />
  <figcaption>The waterfall column as it is actually saved in Clay. This panel is the one step I configured by hand rather than through the API, and the two populated rows are my own address being used as the test.</figcaption>
</figure>

A waterfall moves on when a step comes back empty, but a validator always answers something, safe, catch-all, or invalid. So I built the relay that talks to Reoon to only hand back the email when the check says safe outright. Everything else, including catch-all, comes back empty on purpose, so the waterfall reads it as a miss and keeps going.

## What changed between draft and send

The first proof run looked clean. I pulled 36 people from my own database, hid their real emails, fed the function just names and domains, and it answered 28 of them.

Before trusting any of it, I checked every answer straight against Reoon, outside Clay. Only 13 held up. The other 15 didn't: 14 sat on catch-all domains, the kind of address that says yes to anything you type in front of the @ sign, and one was flat wrong.

The bug was in how the function picked a winner. It skipped its own deep check whenever two validators agreed, and on a catch-all domain they always agree, so agreement got treated as proof.

The fix was simpler than the bug. Nothing wins now unless the live check says safe outright, and catch-all can't say that. Then I ran all 36 rows again from scratch, because a test you don't re-run after fixing what it tests doesn't prove anything.

## The number that moved

Before the fix, the function answered 28 rows and only 13 of them were provable. After the fix, it answered 15, and all 15 held up against an independent recheck, zero catch-all, zero wrong. Fewer answers, but every one of them stands up outside my own pipeline.

Clay's own Work Email lookup answered 35 of the same 36 rows, more than double my recall, but only 21 of those 35 passed the same recheck, the other 14 catch-all guesses wearing a vendor database's coat. If your list lives in a database, their tool wins. If it doesn't, mine is for the person no database has.

## What I'd change

The function still refuses on nicknames and middle initials. Patricia goes by patti, and right now that's a flat miss instead of a guess worth checking. I'd add a small table of common name variants so those rows get a real shot instead of an automatic pass.

I'd also run Work Email first as a cheap opening pass, and only send a row to my waterfall when the vendor lookup comes back empty or unprovable. Their database already knows who's in it. My waterfall should only spend a live mailbox check on the ones it doesn't.
