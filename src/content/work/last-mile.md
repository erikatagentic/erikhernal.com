---
page: 5
struck:
  was: "39"
  now: "25"
  label: "restaurants left after I cut 14 before sending"
fast: "39 drafted, 14 cut, 25 sent, 0 replies."
title: "The last mile is everything that changes between the draft and the send"
slug: "last-mile"
cohort: "AlphaForge P9"
date: 2026-08-31
one_line: "I sent 25 cold emails under a real company's name and got zero replies, after cutting 14 of 39 restaurants right before send."
number:
  label: "cut before sending"
  value: "14 of 39"
  source: "prompt9/p9_report.py, read from Clay 2026-09-04"
receipts:
  - file: "p9_ledger.jsonl"
    count: "53 lines"
    proves: "every queue, status change and copy refresh was logged as an event when it happened, not written up after the fact"
  - file: "p9_lib.test.mjs"
    count: "5 tests, 5 passing"
    proves: "the code that tells a bounce apart from an opt-out apart from a real reply was checked before it ran against anyone's actual inbox"
  - file: "send_list_verification.json"
    count: "23 of 25 addresses checked: 10 confirmed, 5 catch-all, 8 unverifiable, 0 invalid"
    proves: "the addresses on the send list were checked live, not assumed"
  - file: "cuts.json"
    count: "14 entries"
    proves: "the exact reason each of the 14 cut restaurants didn't make the send list"
links: []
---

## What I sent

The segment was the 990 independent restaurants already running a head-to-head competitor of Owner.com, and 376 of those are on Slice. I was sending 25, not 376, so I pulled a working batch of 39 off the top of that list to leave room for the ones I expected to lose before send. The other 337 were never in this project. I picked Slice because it publishes its prices, so every message could carry a number the owner could check against their own bill: $39 a month plus $3 an order on the Online tier, which crosses over a flat $499 plan around 154 orders a month.

Every email went from my own mailbox on my own domain, signed with my name. I told each restaurant what I was doing in one line: a GTM engineer studying Owner.com's market for a program. I've never worked for Owner. The cap was 25 messages, and that's what went out, all on August 31.

## The system

Clay held one record per restaurant, tracking the message from draft through send to reply. A workflow wrote every update through one webhook, so the sender and the reply loop both talked to Clay the same way.

Email Bison did the actual sending: plain text, no open tracking or unsubscribe link, just a reply-stop line I'd honor on sight. A poller on my server checked Bison every five minutes for bounces and replies, then mirrored each one into Clay with a ping to Slack.

I'd written tests for the logic that separates a bounce from an opt-out from a real answer, so someone typing "stop" would trip the same code whether they meant it or whether I'd misread a reply that actually said they'd switched vendors. The campaign sat behind a fence too, so my own auto-reply machine could never touch it.

## What changed between draft and send

The segment data was four days old by the time I sat down to send, so I re-checked every restaurant's site first. Three of them had switched vendors since the draft: their order buttons now pointed at Toast or a DoorDash storefront, and the Slice arithmetic I'd written no longer described their bill. Borrowing Owner's name raised the bar on that check, because a wrong number under their name costs them, not just me.

Then Bison refused eleven more restaurants when I tried to load them, because the only address they'd published was a personal mailbox on Gmail, mostly. I'd drafted some of my sharpest messages for exactly those owners, and I could have routed around the block by sending from my own Gmail account instead.

I didn't. A cold email to someone's personal inbox is a different act from one to their business address, and the rule I keep for my own campaigns doesn't bend because these happened to be good drafts.

## The number that moved

Fourteen of the 39 restaurants in the segment got cut before a single email went out: three for a vendor that had changed, eleven for a personal-only mailbox. That's the number that actually moved, from 39 down to 25.

The 25 that went out sent clean except for one bounce, all on August 31. Nobody replied and nobody opted out; twenty-four of the twenty-five just sat in silence. I'm reporting that flat, because a project built to measure the last mile has to report a null result the same way it would report a good one.

## What I'd change

I'd stop padding the list to hit a round number. Two of the 25 seats went to restaurants with thin research, one site my scraper could only partly read and one that was just an image and an ordering button, because I'd set 25 as the target and wanted to reach it. Twenty-three strong messages beat 25 with two weak ones riding along.

I'd also check whether an address is a personal mailbox before I draft the email. Eleven of my best drafts got cut at the load step because the owner's only listed address was a Gmail account, and I'd already spent the time writing them.
