---
page: 3
struck:
  was: "469"
  now: "233"
  label: "restaurants really running a loyalty program"
fast: "My check was matching a word in config code. The real count is 233."
title: "I shipped a wrong number, then went back and checked"
slug: "wrong-number"
cohort: "AlphaForge P8 and the recut"
date: 2026-08-28
one_line: "I segmented 2,331 restaurants for Owner.com, shipped a loyalty count that was wrong, and rebuilt the cut around what each one actually runs."
number:
  label: "restaurants counted as running a loyalty program, of 968 reachable accounts"
  value: "469 to 233"
  source: "recut/post-corrections-20260827.md"
receipts:
  - file: "recut/README.md"
    count: "2,314 of 2,331 accounts re-measured"
    proves: "the old boundary between a competitor vendor and a till was assumed, never tested, on either side"
  - file: "recut/post-corrections-20260827.md"
    count: "loyalty count corrected from 469 to 233 on 968 accounts"
    proves: "the detector was matching a word in vendor config, not a live feature"
  - file: "recut/recut_assignments.csv"
    count: "2,331 rows, one per restaurant"
    proves: "every restaurant in the audience got assigned a segment under the new cut, not a sample of it"
  - file: "clay_recut_audiences.json"
    count: "5 audiences"
    proves: "the recut lives in Clay, not in a spreadsheet"
links: []
---

## What I sent

I segmented 2,331 independent US restaurants for Owner.com, who sell all-in-one ordering and marketing to owner-operators. The cut was who owns the restaurant's ordering channel today: a competitor installed (990 accounts), no channel of their own, renting space on a marketplace (361), or ordering running through their point-of-sale (980). Every row landed in exactly one segment.

Each segment got its own playbook instead of a shared score. Displacement accounts open on the vendor's own pricing, because a rep there is arguing with a named competitor whose prices are public. Renting accounts open on what the marketplaces charge, since there's no incumbent to displace.

POS-adjacent accounts don't open on ordering, since they already have it. They open on the fact the till kept the order and nothing else: no email, no loyalty running. There's no app to bring the diner back either.

I also audited that last claim. The post said 613 of the POS accounts capture an email and 469 show some loyalty mechanism, with only 210 running none of the three.

## The system

The segmentation lives in Clay as a router node inside a published workflow. It reads the ordering vendor detected on the restaurant's own site. Ten head-to-head vendors route to displacement and seven point-of-sale systems route to POS-adjacent, while anything with no channel of its own routes to renting. A restaurant added tomorrow gets routed without me touching anything.

The marketing audit was a separate script that checked each restaurant's own website for an email or phone capture and a branded ordering app. It also checked whether a loyalty program showed as live. That script only ran on the POS segment, because its header assumed the other two were already covered by their vendor.

## What changed between draft and send

After I shipped it, I got pushed on the boundary itself: the vendors I'd bucketed do more than the labels gave them credit for. So instead of carrying the labels forward from an earlier post, I read the vendors' own product pages.

Toast sells commission-free ordering with loyalty and push notifications built into its own branded app. Square sells a website builder plus email and text campaigns. Clover and SpotOn sell the same shape of thing, and Owner sells all of it, plus a point of sale of its own now too.

The line I'd drawn between "a competitor" and "a till" didn't hold, because the till vendors sell the same marketing surface the competitor vendors do. That sent me back to run the audit across all 2,331 accounts instead of the 980 I'd checked, and to check the audit's own logic too.

## The number that moved

Running the same loyalty check twice on the same 200 accounts gave a different answer 9 percent of the time. So I read what the rule was actually matching. It fired on the word "loyalty" anywhere in the page source, including inside the ordering platform's own configuration code, on pages where that same config said the feature was switched off.

Counting only a program a diner can actually see, or a setting that's genuinely on, the loyalty number falls from 469 to 233 on the 968 reachable accounts in that segment. Email capture slipped too, from 613 to 607. The branded app count is the one that held, at 36. Restaurants with none of the three rise from 210 to 255.

Running the audit across the full 2,331 flipped the finding I cared about more. I'd assumed the displacement accounts were covered because their vendor sells marketing. Two thirds of them, 652 of the 987 whose sites I could actually read, run nothing visible at all. Slice is the extreme: of 376 Slice restaurants, 90 percent show none of the three.

## What I'd change

I'd wire the capability check into Clay as a live enrichment instead of a script I run by hand, so a new restaurant gets measured the moment it lands instead of waiting on me to notice.

And I'd split the largest new segment, the 1,048 restaurants where someone else owns the diner relationship, before I call any of them. Right now it puts a Slice account and a Toast account in one bucket, and they don't get the same opener.
