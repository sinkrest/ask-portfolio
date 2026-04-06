import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const knowledgeDir = join(process.cwd(), 'knowledge');
    const files = readdirSync(knowledgeDir).filter(f => f.endsWith('.md'));

    const sources = files.map(filename => {
      const raw = readFileSync(join(knowledgeDir, filename), 'utf-8');
      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
      if (!fmMatch) return null;

      const fm = fmMatch[1];
      return {
        filename,
        title: fm.match(/title:\s*"(.+?)"/)?.[1] || filename,
        category: fm.match(/category:\s*"(.+?)"/)?.[1] || '',
        url: fm.match(/url:\s*"(.+?)"/)?.[1] || null,
      };
    }).filter(Boolean);

    return res.status(200).json({ sources });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
