---
title: "Case Study — Ghost PM Signal"
category: "case-study"
keywords: ["case study", "Ghost", "PM Signal", "intelligence", "dashboard", "data sources", "synthesis", "competitive", "forum", "GitHub", "Hacker News"]
url: "https://ghost-pm-signal.vercel.app"
---

# Case Study: Ghost PM Signal — PM Intelligence Dashboard

**Type:** AI-powered product intelligence
**Live:** ghost-pm-signal.vercel.app
**GitHub:** github.com/sinkrest/ghost-pm-signal
**Stack:** Claude API, Vanilla JS, Vercel serverless, 7 live data sources

## The Problem

PMs at independent platforms face a recurring challenge: signal is everywhere but synthesised nowhere. User feedback lives on a forum. Competitor moves land in a changelog. Community sentiment is scattered across Hacker News. Strategic bets are buried in GitHub issues.

Roman wanted to build a tool that does this aggregation and synthesis automatically — turning scattered signals into a PM decision brief.

## What Was Built

A live PM intelligence dashboard aggregating six data sources into one interface, with Claude synthesising everything into a weekly decision brief.

**Six signal sources:**
- Ghost Forum Ideas — top-voted feature requests (880+ topics, live vote counts)
- GitHub (TryGhost/Ghost) — feature requests by reaction count
- GitHub (TryGhost/ActivityPub) — Ghost's Fediverse strategic bet
- Hacker News (Algolia API) — technical community sentiment
- Kit (ConvertKit) Changelog — what Ghost's closest competitor ships
- Ghost Changelog + Blog RSS — what Ghost has shipped

**Claude synthesises into a four-section PM brief:**
1. Top 3 Opportunities This Week — with evidence and recommended action
2. Competitive Gap Alert — what Kit shipped that Ghost doesn't have
3. Strategic Signal: ActivityPub & Fediverse — accelerating or stalling?
4. What to Deprioritise — what looks urgent but isn't

## Design Decisions

**Separate data loading from synthesis:** The dashboard loads all sources on page open — fast, zero AI cost. Synthesis is on-demand. This makes raw data immediately useful and keeps the synthesis moment deliberate.

**Seven sources for triangulation:** A single source is a view. Seven sources, connected, is intelligence. A feature request with 174 Forum votes becomes urgent when a competitor shipped the same feature last quarter. The tool surfaces that connection.

**Kit as competitor benchmark:** Kit publishes a parseable changelog and is Ghost's most direct competitor in creator monetisation. What Kit ships is what Ghost users start expecting.

## Key Takeaways

- Multi-source intelligence aggregation — not just data display but signal synthesis
- Claude as a PM analyst: takes raw data and produces a structured decision brief
- Designed for real PM workflows: open Monday morning, know what to prioritise
- Built in 2 days as part of the Ghost Creator Suite — demonstrates rapid execution
- Architecture pattern: data collection → display → on-demand AI synthesis (reusable for any platform)
