import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Load knowledge base at cold start (cached across invocations)
let knowledgeBase = null;

function loadKnowledge() {
  if (knowledgeBase) return knowledgeBase;

  const knowledgeDir = join(process.cwd(), 'knowledge');
  const files = readdirSync(knowledgeDir).filter(f => f.endsWith('.md'));

  knowledgeBase = files.map(filename => {
    const raw = readFileSync(join(knowledgeDir, filename), 'utf-8');

    // Parse frontmatter
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!fmMatch) return null;

    const frontmatter = fmMatch[1];
    const content = fmMatch[2].trim();

    const title = frontmatter.match(/title:\s*"(.+?)"/)?.[1] || filename;
    const category = frontmatter.match(/category:\s*"(.+?)"/)?.[1] || '';
    const url = frontmatter.match(/url:\s*"(.+?)"/)?.[1] || '';
    const keywordsMatch = frontmatter.match(/keywords:\s*\[(.+?)\]/);
    const keywords = keywordsMatch
      ? keywordsMatch[1].match(/"([^"]+)"/g)?.map(k => k.replace(/"/g, '')) || []
      : [];

    return { filename, title, category, url, keywords, content };
  }).filter(Boolean);

  return knowledgeBase;
}

function scoreRelevance(doc, question) {
  const q = question.toLowerCase();
  let score = 0;

  // Keyword matches (highest weight)
  for (const kw of doc.keywords) {
    if (q.includes(kw.toLowerCase())) score += 10;
  }

  // Title word matches
  const titleWords = doc.title.toLowerCase().split(/\s+/);
  for (const tw of titleWords) {
    if (tw.length > 3 && q.includes(tw)) score += 5;
  }

  // Content snippet matches (sample first 500 chars)
  const snippet = doc.content.substring(0, 500).toLowerCase();
  const queryWords = q.split(/\s+/).filter(w => w.length > 3);
  for (const qw of queryWords) {
    if (snippet.includes(qw)) score += 2;
  }

  // Category bonus for common question types
  if ((q.includes('built') || q.includes('project') || q.includes('tool') || q.includes('portfolio')) && doc.category === 'portfolio') score += 8;
  if ((q.includes('experience') || q.includes('worked') || q.includes('career') || q.includes('job')) && doc.category === 'experience') score += 8;
  if ((q.includes('skill') || q.includes('technical') || q.includes('can he') || q.includes('capable')) && doc.category === 'skills') score += 8;
  if ((q.includes('case study') || q.includes('example') || q.includes('detail') || q.includes('how did')) && doc.category === 'case-study') score += 8;
  if ((q.includes('approach') || q.includes('philosophy') || q.includes('think') || q.includes('style') || q.includes('why') || q.includes('hire')) && doc.category === 'philosophy') score += 8;
  if ((q.includes('who') || q.includes('about') || q.includes('background') || q.includes('education')) && doc.category === 'background') score += 8;

  return score;
}

function selectContext(question) {
  const docs = loadKnowledge();
  const scored = docs.map(doc => ({ ...doc, score: scoreRelevance(doc, question) }));
  scored.sort((a, b) => b.score - a.score);

  // Always include top 3, add more if scores are high
  const selected = scored.slice(0, 3);
  for (let i = 3; i < scored.length && i < 6; i++) {
    if (scored[i].score >= 5) selected.push(scored[i]);
  }

  return selected;
}

const SYSTEM_PROMPT = `You are the AI assistant for Roman Martins' portfolio. You answer questions about Roman's professional background, skills, projects, and experience using the provided knowledge base.

RULES:
1. Answer ONLY based on the provided knowledge base documents. Each document is labelled with a number like [Source 1], [Source 2], etc.
2. Cite sources using inline numbered references like [1], [2] when you reference specific information from a document.
3. If information isn't in the knowledge base, say "I don't have specific information about that, but you can reach Roman directly at romanmartins.com"
4. Be conversational, warm, and concise — like a knowledgeable colleague, not a database.
5. When discussing tools or projects, always mention the live URL so visitors can try them.
6. Keep answers under 300 words unless the question clearly needs depth.
7. Never fabricate facts, achievements, or metrics not in the knowledge base.
8. Format responses with markdown for readability — use bold, lists, and headers where helpful.
9. If asked about sensitive topics (salary, personal life, job search status, whether Roman is looking for a new role, etc.), politely redirect to professional topics and what he has built.
10. End responses naturally — no "feel free to ask" filler.
11. NEVER mention or imply that Roman is actively job searching, interviewing, or looking for a new position. He is a builder and practitioner — frame everything through that lens.
12. The Ghost tools were built to explore a product domain, not for an interview. Frame them as curiosity-driven building.`;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured.' });

  const { messages, question } = req.body;
  if (!question) return res.status(400).json({ error: 'Question is required.' });

  try {
    // Select relevant knowledge
    const context = selectContext(question);

    // Build context block
    const contextBlock = context.map((doc, i) => (
      `[Source ${i + 1}] — ${doc.title}${doc.url ? ` (${doc.url})` : ''}\n${doc.content}`
    )).join('\n\n---\n\n');

    // Build conversation messages
    const conversationMessages = [];

    // Add prior messages if multi-turn
    if (messages && messages.length > 0) {
      for (const msg of messages) {
        conversationMessages.push({ role: msg.role, content: msg.content });
      }
    }

    // Add current question with context
    conversationMessages.push({
      role: 'user',
      content: `KNOWLEDGE BASE:\n\n${contextBlock}\n\n---\n\nQUESTION: ${question}`
    });

    // Source metadata for the frontend
    const sourceMeta = context.map((doc, i) => ({
      index: i + 1,
      title: doc.title,
      category: doc.category,
      url: doc.url || null,
      filename: doc.filename,
    }));

    // Call Claude with streaming
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        stream: true,
        system: SYSTEM_PROMPT,
        messages: conversationMessages,
      }),
    });

    if (!response.ok) {
      const errData = await response.json();
      return res.status(response.status).json({ error: errData?.error?.message || 'Claude API error' });
    }

    // Stream SSE to client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send source metadata first
    res.write(`data: ${JSON.stringify({ type: 'sources', sources: sourceMeta })}\n\n`);

    // Stream Claude's response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const event = JSON.parse(data);
            if (event.type === 'content_block_delta' && event.delta?.text) {
              res.write(`data: ${JSON.stringify({ type: 'text', text: event.delta.text })}\n\n`);
            }
          } catch (e) {
            // Skip unparseable lines
          }
        }
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();

  } catch (err) {
    console.error('Chat error:', err);
    return res.status(500).json({ error: err.message || 'Unexpected error' });
  }
}
