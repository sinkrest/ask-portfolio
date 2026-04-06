---
title: "Case Study — AI Children's Book Platform"
category: "case-study"
keywords: ["case study", "children's book", "AI product", "shipped", "revenue", "1000 books", "DALL-E", "Midjourney", "ChatGPT", "character consistency", "D2C", "print"]
url: "https://romanmartins.com/projects/ai-childrens-book"
---

# Case Study: AI-Powered Personalised Children's Book Platform

**Role:** AI Product Owner
**Outcome:** 1,000+ books sold in Germany
**Stack:** ChatGPT, DALL-E, Midjourney, D2C print-on-demand fulfilment

## The Problem

Every child deserves to be the hero of their own story — not just a name swapped into a generic template, but a book built around them. Yet truly personalised children's books didn't exist at scale. Custom illustration was expensive and slow.

The opportunity: use generative AI to make hyper-personalised children's books accessible, affordable, and fast — delivering them as physical products.

## What Was Built

A direct-to-consumer platform where parents submitted personalisation details about their child (appearance, personality, challenges they're working through). The platform generated a complete illustrated book featuring the child as the protagonist.

The core insight was pedagogical: children process difficult situations more effectively when they can observe themselves navigating the same challenge from a safe, story-based distance.

**Delivery flow:**
1. Parent completes customisation request via web app
2. AI generates story text and full illustration set
3. Digital proof sent for approval
4. Printed and shipped D2C (print-on-demand)

## Roman's Role

Owned the product end to end — not as an engineer, but as the person responsible for making the AI system produce a consistent, high-quality product at scale.

- **Prompt architecture:** Designed the prompt system for story generation (ChatGPT) — structured to accept variable child inputs and produce narratively coherent, age-appropriate stories
- **Visual consistency system:** Engineered the character generation pipeline using DALL-E, establishing a method for producing a consistent child character across 15–20 illustrations per book
- **Multi-model orchestration:** Used Midjourney for high-quality backgrounds, then composited character into scene
- **Quality control:** Reviewed and curated outputs, building judgement on premium vs. generic quality
- **Product flow design:** Defined the approval workflow and digital-to-print handoff

## The Hard Problem: Character Consistency

The bottleneck was making the same child character appear consistently across 15–20 illustrations. Early AI image models produced a slightly different version each time — different face shape, hair tone, proportions.

**Solution:** Developed character "archetypes" — precisely described and reproducible across generations. Children with similar characteristics mapped to a refined archetype prompt, maintaining visual consistency without unique generation for every book. The trade-off was customisation depth vs. production speed and consistency — the team leaned toward consistency.

## Results

- 1,000+ individual books sold in the German market
- Positive customer feedback — children's emotional connection validated the core thesis
- Demonstrated AI-generated personalised content could meet commercial print quality at scale

## Key Takeaways

- AI product ownership in a live, revenue-generating context — not a demo or prototype
- Prompt engineering at system level — designing a reproducible production pipeline
- Trade-off decision making under real constraints: customisation depth vs. consistency vs. speed
- Multi-model orchestration before it was common: ChatGPT + DALL-E + Midjourney in one pipeline
- Shipping physical products with AI — the gap between "cool demo" and "product in a customer's hands"
