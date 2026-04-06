---
title: "Case Study — AI Implementation Scoping Tool"
category: "case-study"
keywords: ["case study", "scoping", "implementation", "two-phase", "prompt architecture", "structured output", "JSON", "discovery", "Claude API"]
url: "https://ai-scoping-tool.vercel.app"
---

# Case Study: AI Implementation Scoping Tool

**Type:** Portfolio project — AI tooling
**Live:** ai-scoping-tool.vercel.app
**GitHub:** github.com/sinkrest/ai-scoping-tool
**Stack:** Claude API, Vanilla JS, Marked.js

## The Problem

AI implementation projects fail at a predictable point: the gap between "we want to use AI" and "here's what to actually build." This gap is where business conversations about AI lose momentum — too abstract for decisions, too early for engineers.

The first deliverable of any AI implementation engagement is a scoping document. Producing it is repeatable — the same discovery questions come up every time. Roman wanted to codify this process into a tool.

## What Was Built

A single-page browser tool that runs a structured two-phase AI implementation discovery session:

**Phase 1 — Discovery:** Claude generates three targeted questions about the user's business problem (current process, systems involved, pain points). The user answers each one in a conversational interface.

**Phase 2 — Scoping:** The full context is passed to Claude, which generates a structured scoping document covering: recommended AI approach, process steps with automation potential, effort vs. impact analysis, phased rollout plan, risks, success metrics, and next steps.

## Design Decisions

**Two separate prompts, not one:** The question generation and scoping document prompts have fundamentally different jobs. The first produces structured JSON — three clean question strings. The second produces long-form structured markdown. Combining them would trade reliability for convenience.

**Pre-generate all three questions at once:** An alternative was calling Claude per question, adapting dynamically. But three API calls means three times the latency. Pre-generating gives one call, instant display, and predictable coverage.

**Vanilla JS, no framework:** No build step, no dependencies, instantly deployable. The constraint forces cleaner state management — everything in one object.

## Prompt Architecture

The question generation system prompt instructs Claude to return a JSON array — and only a JSON array. The app parses with regex + JSON.parse(), resilient to occasional LLM preamble. The scoping document prompt specifies exact markdown structure with explicit section headers and table formats — ensuring consistent, immediately usable output.

## Key Takeaways

- Demonstrates prompt architecture as a product design discipline — not just writing prompts but designing reliable AI pipelines
- Two-phase workflow pattern: discovery → generation, reusable across many AI tool designs
- Structured output from LLMs requires structured prompts — the more precisely you specify format, the more reliably you get it
- Defensive handling (JSON validation, shape checking) separates a demo from a reliable tool
- Zero-dependency deployment: one HTML file, one JS file, one API route — live in minutes
