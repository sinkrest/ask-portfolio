// ============================================
// Ask My Portfolio — App Logic
// ============================================

const state = {
  messages: [],        // Conversation history for multi-turn
  isStreaming: false,
  hasStarted: false,
  sources: [],         // Knowledge base metadata
  theme: localStorage.getItem('amp-theme') || 'dark',
  stickToBottom: true, // Whether to auto-scroll — disabled if user scrolls up
};

// Threshold (px) — if the user is within this distance from the bottom,
// we consider them "at the bottom" and keep auto-scrolling. Otherwise we leave
// their scroll position alone so they can read earlier content while streaming.
const STICK_THRESHOLD = 220;

// Time-based throttle for streamed markdown re-parses. Haiku emits tokens much
// faster than the eye can follow; 60fps re-parses look "rushed" and jittery.
// ~120ms (~8fps) is a calm reading cadence — text still feels live, but each
// frame has settled before the next one replaces it.
const STREAM_RENDER_INTERVAL_MS = 120;

const FOLLOW_UPS = [
  [
    { icon: '\u25B7', text: 'The Forkable Factory thesis', question: 'What is the Forkable Factory and why does Roman believe physical products should be developed like software?' },
    { icon: '\u2726', text: 'AI workflows inside an OEM', question: 'What AI-assisted workflows has Roman deployed inside an industrial company?' },
    { icon: '\u2699', text: 'His AI + technical skills', question: 'What are Roman\'s AI and technical skills?' },
  ],
  [
    { icon: '\u25C8', text: 'How does he approach PM?', question: 'How does Roman approach product management?' },
    { icon: '\u2605', text: 'What has he shipped?', question: 'What products has Roman shipped to real customers?' },
    { icon: '\u2794', text: 'What sets him apart?', question: 'What makes Roman unique as a product leader?' },
  ],
  [
    { icon: '\u25B7', text: 'The Scoping Tool', question: 'Walk me through the AI Implementation Scoping Tool case study' },
    { icon: '\u2726', text: 'How does he think about AI?', question: 'How does Roman think about building AI products?' },
    { icon: '\u2699', text: 'Career arc — factory to AI', question: 'Walk me through Roman\'s career arc from LEGO polymer technician apprentice to AI product leader' },
  ],
  [
    { icon: '\u25C8', text: 'Product Signal case study', question: 'Tell me about the Product Signal dashboard — how does it work?' },
    { icon: '\u2605', text: 'His product philosophy', question: 'What is Roman\'s product philosophy and working style?' },
    { icon: '\u2794', text: 'Manufacturing + AI?', question: 'How does Roman\'s manufacturing background help in AI product work?' },
  ],
];

// --- DOM Elements ---
const hero = document.getElementById('hero');
const suggestions = document.getElementById('suggestions');
const messagesEl = document.getElementById('messages');
const inputTextarea = document.getElementById('inputTextarea');
const sendBtn = document.getElementById('sendBtn');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const newChatBtn = document.getElementById('newChatBtn');
const infoBtn = document.getElementById('infoBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const knowledgeList = document.getElementById('knowledgeList');

// --- Init ---
function init() {
  applyTheme(state.theme);
  loadSources();
  setupListeners();
  inputTextarea.focus();
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  state.theme = theme;
  localStorage.setItem('amp-theme', theme);

  if (theme === 'light') {
    themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  } else {
    themeIcon.innerHTML = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';
  }
}

async function loadSources() {
  try {
    const res = await fetch('/api/sources');
    const data = await res.json();
    state.sources = data.sources || [];
    renderKnowledgeList();
  } catch (e) {
    console.warn('Could not load sources:', e);
  }
}

function renderKnowledgeList() {
  if (!state.sources.length) return;
  knowledgeList.innerHTML = state.sources.map(s =>
    `<li>${s.title}</li>`
  ).join('');
}

function setupListeners() {
  sendBtn.addEventListener('click', () => handleSend());

  inputTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  inputTextarea.addEventListener('input', () => autoResize());

  // Detach auto-scroll if the user scrolls up while streaming — lets them
  // read earlier content without the page yanking them back to the bottom.
  window.addEventListener('scroll', () => {
    if (!state.isStreaming) return;
    const distanceFromBottom = document.body.scrollHeight - (window.scrollY + window.innerHeight);
    state.stickToBottom = distanceFromBottom < STICK_THRESHOLD;
  }, { passive: true });

  // Suggested questions (initial)
  document.querySelectorAll('.suggestion-card').forEach(card => {
    card.addEventListener('click', () => {
      const q = card.getAttribute('data-question');
      if (q) sendMessage(q);
    });
  });

  themeToggle.addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  newChatBtn.addEventListener('click', () => resetChat());

  infoBtn.addEventListener('click', () => modalOverlay.classList.add('visible'));
  modalClose.addEventListener('click', () => modalOverlay.classList.remove('visible'));
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('visible');
  });
}

function autoResize() {
  inputTextarea.style.height = 'auto';
  inputTextarea.style.height = Math.min(inputTextarea.scrollHeight, 120) + 'px';
}

function handleSend() {
  const text = inputTextarea.value.trim();
  if (!text || state.isStreaming) return;
  sendMessage(text);
}

// Soft reset back to the landing state — no page reload needed.
function resetChat() {
  if (state.isStreaming) return;
  state.messages = [];
  state.hasStarted = false;
  state.stickToBottom = true;
  messagesEl.innerHTML = '';
  hero.classList.remove('collapsed');
  suggestions.classList.remove('hidden');
  newChatBtn.classList.remove('visible');
  inputTextarea.value = '';
  inputTextarea.style.height = 'auto';
  window.scrollTo({ top: 0 });
  inputTextarea.focus();
}

// --- Core Chat Logic ---
async function sendMessage(text) {
  state.isStreaming = true;
  state.stickToBottom = true;
  sendBtn.disabled = true;

  // Remove any existing follow-up chips
  document.querySelectorAll('.followups').forEach(el => el.remove());

  // Collapse hero on first message — lock scroll position to prevent jump
  if (!state.hasStarted) {
    state.hasStarted = true;
    const scrollY = window.scrollY;
    const heroHeight = hero.offsetHeight + suggestions.offsetHeight;
    hero.classList.add('collapsed');
    suggestions.classList.add('hidden');
    newChatBtn.classList.add('visible');
    // Compensate: shift scroll up by the height removed
    window.scrollTo(0, Math.max(0, scrollY - heroHeight));
  }

  // Clear input
  inputTextarea.value = '';
  inputTextarea.style.height = 'auto';

  // Render user message
  renderUserMessage(text);

  // Add to history
  state.messages.push({ role: 'user', content: text });

  // Show typing
  const typingEl = showTyping();
  scrollToBottom();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: state.messages.slice(0, -1),
        question: text,
      }),
    });

    if (!res.ok) {
      let errMsg = 'Request failed';
      try { const err = await res.json(); errMsg = err.error || errMsg; } catch(e) {}
      throw new Error(errMsg);
    }

    // Remove typing indicator
    if (typingEl.parentNode) typingEl.remove();

    // Process stream
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';
    let sourceMeta = [];
    let assistantEl = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw) continue;

        try {
          const event = JSON.parse(raw);

          if (event.type === 'sources') {
            sourceMeta = event.sources || [];
          }

          if (event.type === 'text') {
            if (!assistantEl) {
              assistantEl = createAssistantMessage();
            }
            fullText += event.text;
            scheduleStreamingRender(assistantEl, () => fullText);
          }

          if (event.type === 'done') {
            flushStreamingRender(assistantEl, fullText);
            if (assistantEl && sourceMeta.length > 0) {
              renderSourceCards(assistantEl, sourceMeta, fullText);
            }
            state.messages.push({ role: 'assistant', content: fullText });
          }
        } catch (e) {
          // Skip parse errors
        }
      }
    }

    // Process any remaining buffer
    if (buffer.trim()) {
      try {
        const remaining = buffer.trim();
        if (remaining.startsWith('data: ')) {
          const event = JSON.parse(remaining.slice(6).trim());
          if (event.type === 'text' && assistantEl) {
            fullText += event.text;
            scheduleStreamingRender(assistantEl, () => fullText);
          }
          if (event.type === 'done') {
            flushStreamingRender(assistantEl, fullText);
            if (assistantEl && sourceMeta.length > 0) {
              renderSourceCards(assistantEl, sourceMeta, fullText);
            }
            if (!state.messages.find(m => m.content === fullText && m.role === 'assistant')) {
              state.messages.push({ role: 'assistant', content: fullText });
            }
          }
        }
      } catch(e) {}
    }

    // Safety: if assistant text was received but 'done' event was missed, still save it
    if (fullText && !state.messages.find(m => m.content === fullText && m.role === 'assistant')) {
      flushStreamingRender(assistantEl, fullText);
      if (assistantEl && sourceMeta.length > 0) {
        renderSourceCards(assistantEl, sourceMeta, fullText);
      }
      state.messages.push({ role: 'assistant', content: fullText });
    }

    // Show follow-up suggestions
    renderFollowUps();

  } catch (err) {
    if (typingEl.parentNode) typingEl.remove();
    renderErrorMessage(err.message || 'Something went wrong. Try again.');
  } finally {
    // Always reset — never leave streaming stuck
    state.isStreaming = false;
    sendBtn.disabled = false;
    inputTextarea.focus();
    scrollToBottom();
  }
}

// --- Follow-up Suggestions ---
function renderFollowUps() {
  // Pick a set based on how many exchanges we've had, cycle through
  const turn = Math.floor((state.messages.length - 1) / 2);
  const set = FOLLOW_UPS[turn % FOLLOW_UPS.length];

  // Filter out questions already asked
  const asked = new Set(state.messages.filter(m => m.role === 'user').map(m => m.content.toLowerCase()));
  const available = set.filter(f => !asked.has(f.question.toLowerCase()));
  if (available.length === 0) return;

  const div = document.createElement('div');
  div.className = 'followups';
  div.innerHTML = available.map(f =>
    `<button class="followup-chip" data-question="${escapeAttr(f.question)}">
      <span class="followup-icon">${f.icon}</span> ${escapeHtml(f.text)}
    </button>`
  ).join('');

  messagesEl.appendChild(div);

  // Attach click handlers
  div.querySelectorAll('.followup-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-question');
      if (q && !state.isStreaming) sendMessage(q);
    });
  });

  scrollToBottom();
}

// --- Rendering Functions ---
function renderUserMessage(text) {
  const div = document.createElement('div');
  div.className = 'message message-user';
  div.innerHTML = `<div class="message-user-bubble">${escapeHtml(text)}</div>`;
  messagesEl.appendChild(div);
}

function createAssistantMessage() {
  const div = document.createElement('div');
  div.className = 'message message-assistant';
  const avatar = document.createElement('div');
  avatar.className = 'jarvi-msg-avatar';
  avatar.textContent = 'J';
  div.appendChild(avatar);
  const content = document.createElement('div');
  content.className = 'message-assistant-content';
  div.appendChild(content);
  messagesEl.appendChild(div);
  return div;
}

function renderAssistantContent(el, text) {
  const contentEl = el.querySelector('.message-assistant-content');
  const processed = text.replace(/\[(\d+)\]/g, '<span class="citation-badge" data-ref="$1">$1</span>');
  contentEl.innerHTML = marked.parse(processed);
}

// Map source titles to useful follow-up questions
const SOURCE_QUESTIONS = {
  'About Roman Martins': 'Tell me more about Roman\'s background and career journey',
  'Professional Experience': 'Walk me through Roman\'s professional experience in detail',
  'Skills & Technical Capabilities': 'What are Roman\'s strongest technical and PM skills?',
  'Portfolio — Live Deployed Tools': 'Show me the full list of tools Roman has built',
  'Publishing Suite — Tools for Creator Platforms': 'Tell me the story behind the Publishing Suite',
  'Product Philosophy & Approach': 'How does Roman approach product management and AI?',
  'Thought Leadership & Writing': 'What does Roman write about and what are his key insights?',
  'Case Study — AI Children\'s Book Platform': 'Walk me through the AI children\'s book case study',
  'Case Study — AI Implementation Scoping Tool': 'Tell me about the AI Scoping Tool and its prompt architecture',
  'Case Study — Product Signal': 'How does Product Signal work and what problem does it solve?',
};

function renderSourceCards(el, sources, fullText) {
  const citedNumbers = new Set();
  const matches = fullText.matchAll(/\[(\d+)\]/g);
  for (const m of matches) citedNumbers.add(parseInt(m[1]));

  const cited = sources.filter(s => citedNumbers.has(s.index));
  if (cited.length === 0) return;

  const container = document.createElement('div');
  container.className = 'sources-container';
  container.innerHTML = `
    <div class="sources-label">Sources</div>
    <div class="sources-grid">
      ${cited.map(s => {
        if (s.url) {
          // External link — opens in new tab
          return `
            <a class="source-card" href="${s.url}" target="_blank" rel="noopener">
              <span class="source-card-number">[${s.index}]</span>
              <span class="source-card-title">${escapeHtml(s.title)}</span>
              <span class="source-card-arrow">&nearr;</span>
            </a>
          `;
        } else {
          // No URL — clickable to ask a follow-up about this source
          const followUp = SOURCE_QUESTIONS[s.title] || `Tell me more about: ${s.title}`;
          return `
            <button class="source-card source-card-askable" data-question="${escapeAttr(followUp)}">
              <span class="source-card-number">[${s.index}]</span>
              <span class="source-card-title">${escapeHtml(s.title)}</span>
              <span class="source-card-arrow source-card-dive">&darr;</span>
            </button>
          `;
        }
      }).join('')}
    </div>
  `;
  el.appendChild(container);

  // Attach click handlers for askable source cards
  container.querySelectorAll('.source-card-askable').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-question');
      if (q && !state.isStreaming) sendMessage(q);
    });
  });
}

function renderErrorMessage(text) {
  const div = document.createElement('div');
  div.className = 'message message-assistant';
  div.innerHTML = `
    <div class="message-assistant-content" style="color: var(--text-secondary);">
      ${escapeHtml(text)}<br><br>
      You can reach Roman directly at <a href="https://romanmartins.com" target="_blank">romanmartins.com</a>
    </div>
  `;
  messagesEl.appendChild(div);
}

function showTyping() {
  const div = document.createElement('div');
  div.className = 'typing';
  div.innerHTML = '<div class="jarvi-msg-avatar">J</div><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div><span class="typing-label">thinking</span>';
  messagesEl.appendChild(div);
  scrollToBottom();
  return div;
}

// Gentle auto-scroll. Only nudges when content has actually overflowed the
// viewport, and only while the user hasn't scrolled away. No smooth-scroll
// during streaming — overlapping animations were the source of the old jump.
let scrollPending = false;
function scrollToBottom(options = {}) {
  const { smooth = false, force = false } = options;
  if (!force && state.isStreaming && !state.stickToBottom) return;
  if (scrollPending) return;
  scrollPending = true;
  requestAnimationFrame(() => {
    scrollPending = false;
    const doc = document.documentElement;
    const maxScroll = doc.scrollHeight - window.innerHeight;
    if (window.scrollY >= maxScroll - 2) return; // already there
    window.scrollTo({
      top: maxScroll,
      behavior: smooth ? 'smooth' : 'auto',
    });
  });
}

// Time-throttled streaming render. Streamed chunks arrive faster than the eye
// can follow — rendering every chunk (or every rAF) looks rushed and causes
// layout thrash. A ~120ms floor between renders lets each paragraph settle
// before the next chunk overwrites it, which reads much calmer.
let streamTimer = null;
let lastStreamRender = 0;
function scheduleStreamingRender(el, getText) {
  if (!el) return;
  if (streamTimer !== null) return;
  const elapsed = performance.now() - lastStreamRender;
  const wait = Math.max(0, STREAM_RENDER_INTERVAL_MS - elapsed);
  streamTimer = setTimeout(() => {
    streamTimer = null;
    lastStreamRender = performance.now();
    renderAssistantContent(el, getText());
    scrollToBottom();
  }, wait);
}

function flushStreamingRender(el, text) {
  if (streamTimer !== null) {
    clearTimeout(streamTimer);
    streamTimer = null;
  }
  lastStreamRender = performance.now();
  if (el) renderAssistantContent(el, text);
  scrollToBottom();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// --- Start ---
init();
