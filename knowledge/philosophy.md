---
title: "Product Philosophy & Approach"
category: "philosophy"
keywords: ["philosophy", "approach", "thinking", "methodology", "how", "work style", "values", "build", "ship", "product thinking", "AI approach", "manufacturing mindset", "forkable factory", "industrial AI"]
---

# Product Philosophy & Approach

## Physical Products Should Be Developed The Way Software Is

Roman's core thesis — captured in his Forkable Factory research project — is that the tools, loops, and discipline that made software great (version control, CI, fast iteration, agentic environments) can and should reshape how physical products get developed. His 20 years in manufacturing tell him where the old world is stuck. His AI practitioner work tells him what's now actually possible.

This belief isn't academic. He applies the loop in his own product development practice at an industrial OEM (JENSEN Group) and on a reference hardware implementation in public. The gap between "we use AI" and "we develop products differently because of AI" is where he spends his time.

## Build, Don't Theorise

The best way to understand a product problem is to build something. Not a prototype on paper — a working tool, deployed, that someone can use. This philosophy runs through everything he does:

- Curious about a product domain? Build 7 tools to understand it deeply.
- Learning a new AI capability? Ship a product that uses it.
- Evaluating a market opportunity? Build a tool that serves it.
- Want to prove that agentic workflows can touch physical products? Build a reference hardware implementation.

Roman's portfolio is not theoretical — every tool exists because he wanted to understand a problem deeply enough to solve it.

## Prompt Architecture as Product Design

Roman treats prompt engineering as a product discipline, not a technical one. The questions he asks when designing a prompt system:

- What does the user actually need from this output?
- What format makes the output immediately useful?
- Where does the AI need to be constrained vs. given freedom?
- What happens when the output is wrong — how does the system recover?

This perspective — treating prompts as product specifications — is what enables him to build reliable AI tools rather than impressive demos. It's the same discipline a good mould designer applies to tolerances.

## Context Engineering

One of Roman's key insights: most PMs solving AI product problems focus on giving the model more context. The real skill is giving it less — but the right context. Knowing what to include and what to exclude in a prompt is the difference between a reliable tool and an unpredictable one. Same mindset a factory uses when deciding which parameters to log.

## Ship Fast, Iterate Later

Every tool in Roman's portfolio follows the same pattern: build a focused v1, deploy it, learn from real usage, then decide what to improve. He avoids over-engineering first versions. The AI Scoping Tool was built and deployed in a day. Ghost PM Signal in two days.

This speed is intentional — it's how Roman tests ideas. If the v1 works, iterate. If it doesn't, the learning cost was low. This is the opposite of how traditional industrial product development usually runs — and he brings this tempo into the manufacturing environment he works in today.

## Quality Comes From Manufacturing

Twenty years in industrial environments — from polymer technician craftsman apprentice at LEGO to Product Development Manager at JENSEN — gave Roman a quality mindset that most software PMs don't have. In manufacturing, defects are expensive and visible. This translates directly to AI product work:

- **Defensive error handling:** what happens when Claude returns unexpected output? (Same question a process engineer asks about a moulding machine.)
- **Consistency over cleverness:** archetype system for character consistency in children's books. Parts-per-million thinking applied to model outputs.
- **Process discipline:** structured workflows, not ad hoc prompting. Standard operating procedures for AI pipelines.
- **Safety awareness:** designs AI workflows that respect regulated, long-lifecycle industrial environments — not just consumer SaaS.

## Working Style

- **Autonomous:** Thrives in remote settings with high ownership and low overhead
- **Cross-functional:** Naturally bridges technical, business, and shop-floor perspectives
- **Practitioner:** Prefers building alongside the team to directing from a distance
- **Direct:** Clear communication, no unnecessary meetings, results over process
- **Calibrated to industrial realities:** Comfortable with OEMs, safety requirements, long lifecycles, and global cross-site teams — not just SaaS

## Key Takeaways

- Core thesis: physical products should be developed the way software is — the Forkable Factory loop
- "Build, don't theorise" is the operating principle — every insight comes from shipping
- Prompt architecture is product design: user needs → system design → output quality
- Context engineering: less context, better chosen, beats more context
- Manufacturing quality mindset: defensive handling, consistency, process discipline, safety awareness
- Fast execution with intentional iteration — v1 in hours, not weeks, even inside a traditionally slow industrial environment
