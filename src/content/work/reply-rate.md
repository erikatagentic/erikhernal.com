---
page: 2
struck:
  was: "6.1%"
  now: "0"
  label: "of 29 replies was a person saying yes"
fast: "29 replies, 0 yeses. I quote 0.39% now."
title: "My best reply rate was six percent and none of it was a yes"
slug: "reply-rate"
cohort: "Agentic, my own outbound"
date: 2026-08-24
one_line: "The campaign I was proudest of drew 29 replies. I classified every one and not one person had said yes."
number:
  label: "of the 29 replies were a person saying yes"
  value: "0"
  source: "the campaign's reply scores, Aug 23 2026, 31 classified replies"
receipts:
  - file: "reply-scores-2026-08-23.json"
    count: "31 replies, each with a label, a confidence and a reason"
    proves: "18 out of office, 8 not a fit, 3 bounces, 1 unsubscribe, 1 other, 0 positive"
  - file: "the campaign in Email Bison"
    count: "475 sent to 281 people, 29 unique replies, 7 bounced"
    proves: "the 6.1 percent that looked like interest, read from the sending platform itself"
  - file: "reply scores, every campaign"
    count: "13 campaigns with any positive reply, newest scoring each"
    proves: "58 positive replies from 15,026 people, which is the number I actually quote"
  - file: "the denominator decision, 2026-08-08"
    count: "positives divided by people, not by emails"
    proves: "two of my own tools had silently disagreed on this for three weeks"
links: []
---

## What I sent

A pay-per-meeting offer to nonprofit operations leads. 475 emails to 281 people over August, plain text, from my own domains, one question each. By the only number I was looking at, it was the best campaign I had.

That number was the reply rate. 29 replies against 475 sends is 6.1 percent, and if you've sent cold email you know that's a number you screenshot.

## The system

Every reply lands in Email Bison, gets pulled by a scoring pass, and gets classified into one of eleven labels by an LLM, with a confidence score and a written reason on each one. Positive splits three ways: clearly interested, softly interested, and a referral to someone else. Everything else is out of office, a bounce, an unsubscribe, not a fit, hostile, or a neutral question.

The classification isn't the interesting part. The denominator is. In August I found that two of my own tools had been disagreeing about it for three weeks, because one divided positives by emails sent and the other by people contacted. The same campaign looks twice as good depending on which one you open, so I made it divide by people and left a note saying which.

## What changed between draft and send

I ran the scoring pass over that campaign expecting my best positive rate. The classifier scored 31 messages, which is two more than Bison's 29, because Bison counts unique repliers and the classifier scores every message that came back, bounce notices included. Both numbers are in the file below and I would rather show you the seam than pick the tidier one.

What came back was 18 out of office, 8 not a fit, 3 bounces, 1 unsubscribe, and 1 that fit nothing.

Zero positive. Not one person had said yes, on either count.

Most of my 6.1 percent was auto-replies: ten from people who were away and eight saying the person had left. Most of the rest was people saying no. The metric I'd have put on a slide was measuring who was out of the office or gone for good, and I was about to call it my best campaign.

## The number that moved

The honest one is smaller, and it's the only one I'll quote now. Across the 13 campaigns of mine that have ever produced a positive reply, there are 58 of them from 15,026 people contacted. That's 0.39 percent, and 19 of the 58 were people clearly saying they were interested rather than being polite about it.

So the reply rate on my proudest campaign fell from 6.1 percent to zero, and the number I replaced it with is about a sixteenth the size across everything I've ever sent.

I'd rather quote 0.39 percent that means something than 6.1 percent that means Outlook. Every campaign number in these case studies is the second kind.

## What I'd change

I'd have classified replies on the first campaign instead of the fortieth. The scoring pass took an afternoon to build and it killed a number I'd been repeating for weeks, which makes that afternoon the highest-return work in the whole account.

I'd also stop treating out of office as noise to filter out. Ten of those eighteen automatic replies came from people who were away, which says something about when that audience is reachable in August. The other eight said my list had gone stale. I dropped all of them in a bucket marked other instead of asking what they were telling me.
