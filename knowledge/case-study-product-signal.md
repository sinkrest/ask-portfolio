---
title: "Case Study — Product Signal"
category: "case-study"
keywords: ["case study", "product signal", "pm signal", "intelligence", "dashboard", "data sources", "synthesis", "competitive", "forum", "GitHub", "Hacker News", "publishing suite"]
url: "https://ghost-pm-signal.vercel.app"
---

# Case Study: Product Signal — PM Intelligence Dashboard

**Type:** AI-powered product intelligence
**Live:** ghost-pm-signal.vercel.app
**GitHub:** github.com/sinkrest/ghost-pm-signal
**Stack:** Claude API, Vanilla JS, Vercel serverless, 6 live data sources
**Part of:** Publishing Suite

## The Problem

PMs at independent platforms face a recurring challenge: signal is everywhere but synthesised nowhere. User feedback lives on a forum. Competitor moves land in a changelog. Community sentiment is scattered across Hacker News. Strategic bets are buried in GitHub issues.

Roman wanted a tool that does this aggregation and synthesis automatically — turning scattered signals into a PM decision brief.

## What Was Built

A live PM intelligence dashboard aggregating six data sources into one interface, with Claude synthesising everything into a weekly decision brief.

**Six signal sources:**
- Forum Ideas — top-voted feature requests (880+ topics, live vote counts)
- GitHub platform repo — feature requests by reaction count
- GitHub ActivityPub repo — Fediverse strategic bet
- Hacker News (Algolia API) — technical community sentiment
- Closest competitor changelog — what competitors ship
- Platform changelog + blog RSS — what the platform itself has shipped

**Claude synthesises into a four-section PM brief:**
1. Top 3 Opportunities This Week — with evidence and recommended action
2. Competitive Gap Alert — what competitors shipped that the platform doesn't have
3. Strategic Signal: ActivityPub & Fediverse — accelerating or stalling?
4. What to Deprioritise — what looks urgent but isn't

## Design Decisions

**Separate data loading from synthesis:** The dashboard loads all sources on page open — fast, zero AI cost. Synthesis is on-demand. This makes raw data immediately useful and keeps the synthesis moment deliberate.

**Six sources for triangulation:** A single source is a view. Six sources, connected, is intelligence. A feature request with 174 Forum votes becomes urgent when a competitor shipped the same feature last quarter. The tool surfaces that connection.

**Competitor changelog as benchmark:** The closest competitor publishes a parseable changelog. What the competitor ships is what users start expecting.

## Key Takeaways

- Multi-source intelligence aggregation — not just data display but signal synthesis
- Claude as a PM analyst: takes raw data and produces a structured decision brief
- Designed for real PM workflows: open Monday morning, know what to prioritise
- Part of the Publishing Suite — Roman's exploration of the independent publishing domain through building
- Architecture pattern: data collection → display → on-demand AI synthesis (reusable for any platform, including industrial)
