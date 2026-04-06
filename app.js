// ============================================
// Ask My Portfolio — App Logic
// ============================================

const state = {
  messages: [],        // Conversation history for multi-turn
  isStreaming: false,
  hasStarted: false,
  sources: [],         // Knowledge base metadata
  theme: localStorage.getItem('amp-theme') || 'dark',
};

// --- DOM Elements ---
const hero = document.getElementById('hero');
const suggestions = document.getElementById('suggestions');
const messagesEl = document.getElementById('messages');
const inputTextarea = document.getElementById('inputTextarea');
const sendBtn = document.getElementById('sendBtn');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
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

  // Swap icon
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
  // Send message
  sendBtn.addEventListener('click', () => handleSend());

  inputTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Auto-resize textarea
  inputTextarea.addEventListener('input', () => autoResize());

  // Suggested questions
  document.querySelectorAll('.suggestion-card').forEach(card => {
    card.addEventListener('click', () => {
      const q = card.getAttribute('data-question');
      if (q) sendMessage(q);
    });
  });

  // Theme toggle
  themeToggle.addEventListener('click', () => {
    applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  // Modal
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

// --- Core Chat Logic ---
async function sendMessage(text) {
  state.isStreaming = true;
  sendBtn.disabled = true;

  // Collapse hero on first message
  if (!state.hasStarted) {
    state.hasStarted = true;
    hero.classList.add('collapsed');
    suggestions.classList.add('hidden');
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

  // Scroll
  scrollToBottom();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: state.messages.slice(0, -1), // Prior history
        question: text,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Request failed');
    }

    // Remove typing indicator
    typingEl.remove();

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
            renderAssistantContent(assistantEl, fullText);
            scrollToBottom();
          }

          if (event.type === 'done') {
            // Render citations
            if (assistantEl && sourceMeta.length > 0) {
              renderSourceCards(assistantEl, sourceMeta, fullText);
            }
            // Add to history
            state.messages.push({ role: 'assistant', content: fullText });
          }
        } catch (e) {
          // Skip parse errors
        }
      }
    }

  } catch (err) {
    typingEl.remove();
    renderErrorMessage(err.message || 'Something went wrong. Try again.');
  }

  state.isStreaming = false;
  sendBtn.disabled = false;
  inputTextarea.focus();
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
  const content = document.createElement('div');
  content.className = 'message-assistant-content';
  div.appendChild(content);
  messagesEl.appendChild(div);
  return div;
}

function renderAssistantContent(el, text) {
  const contentEl = el.querySelector('.message-assistant-content');
  // Convert citation references [1], [2] to clickable badges
  const processed = text.replace(/\[(\d+)\]/g, '<span class="citation-badge" data-ref="$1">$1</span>');
  contentEl.innerHTML = marked.parse(processed);
}

function renderSourceCards(el, sources, fullText) {
  // Only show sources that were actually cited
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
        const href = s.url || '#';
        const target = s.url ? ' target="_blank" rel="noopener"' : '';
        return `
          <a class="source-card" href="${href}"${target}>
            <span class="source-card-number">[${s.index}]</span>
            <span class="source-card-title">${escapeHtml(s.title)}</span>
            ${s.url ? '<span class="source-card-arrow">&nearr;</span>' : ''}
          </a>
        `;
      }).join('')}
    </div>
  `;
  el.appendChild(container);
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
  div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  messagesEl.appendChild(div);
  scrollToBottom();
  return div;
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --- Start ---
init();
