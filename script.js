const USE_BACKEND = false;
const BACKEND_URL = "https://your-backend-url.com/chat";

const STORAGE = {
  chat: "titan_hud_chat",
  memory: "titan_hud_memory"
};

const els = {
  chatWindow: document.getElementById("chatWindow"),
  chatForm: document.getElementById("chatForm"),
  messageInput: document.getElementById("messageInput"),
  quickQuestions: document.getElementById("quickQuestions"),
  memoryBox: document.getElementById("memoryBox"),
  saveMemoryBtn: document.getElementById("saveMemoryBtn"),
  clearBtn: document.getElementById("clearBtn"),
  exportBtn: document.getElementById("exportBtn"),
  searchInput: document.getElementById("searchInput"),
  searchResults: document.getElementById("searchResults"),
  detectedSystems: document.getElementById("detectedSystems"),
  guideNotes: document.getElementById("guideNotes"),
  itemCount: document.getElementById("itemCount"),
  scriptCount: document.getElementById("scriptCount"),
  powerCount: document.getElementById("powerCount"),
  systemMode: document.getElementById("systemMode")
};

let config = {
  name: "T.I.T.A.N",
  suggestedQuestions: [
    "How do powers work?",
    "How do I obtain powers?",
    "What scripts control flight?",
    "What files mention beams?",
    "Show item IDs",
    "What systems were detected?"
  ]
};

let knowledge = {
  items: [],
  scripts: [],
  powers: [],
  guides: [],
  catalog: [],
  notes: []
};

let chat = [];
let activeFilter = "all";

async function init() {
  await loadJsonFiles();
  loadLocalState();
  renderStats();
  renderQuickQuestions();
  renderDetectedSystems();
  renderGuideNotes();
  renderChat();
  runSearch("");

  els.chatForm.addEventListener("submit", onSubmit);
  els.saveMemoryBtn.addEventListener("click", saveMemory);
  els.clearBtn.addEventListener("click", clearChat);
  els.exportBtn.addEventListener("click", exportChat);
  els.searchInput.addEventListener("input", () => runSearch(els.searchInput.value));

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.filter;
      runSearch(els.searchInput.value);
    });
  });
}

async function loadJsonFiles() {
  try {
    const companionResponse = await fetch("companion.json");
    if (companionResponse.ok) {
      config = { ...config, ...(await companionResponse.json()) };
    }
  } catch {}

  try {
    const knowledgeResponse = await fetch("data/pack_knowledge.json");
    if (knowledgeResponse.ok) {
      knowledge = { ...knowledge, ...(await knowledgeResponse.json()) };
      els.systemMode.textContent = "Pack knowledge engine";
    }
  } catch {
    els.systemMode.textContent = "Offline demo engine";
  }
}

function loadLocalState() {
  const savedChat = localStorage.getItem(STORAGE.chat);
  const savedMemory = localStorage.getItem(STORAGE.memory);

  if (savedChat) {
    try {
      chat = JSON.parse(savedChat);
    } catch {
      chat = [];
    }
  }

  if (savedMemory) {
    els.memoryBox.value = savedMemory;
  }
}

function saveChat() {
  localStorage.setItem(STORAGE.chat, JSON.stringify(chat));
}

function saveMemory() {
  localStorage.setItem(STORAGE.memory, els.memoryBox.value.trim());
  addMessage("system", "Local memory saved.");
}

function renderStats() {
  els.itemCount.textContent = knowledge.items?.length || 0;
  els.scriptCount.textContent = knowledge.scripts?.length || 0;
  els.powerCount.textContent = knowledge.powers?.length || 0;
}

function renderQuickQuestions() {
  els.quickQuestions.innerHTML = "";
  for (const question of config.suggestedQuestions || []) {
    const btn = document.createElement("button");
    btn.className = "quick-question";
    btn.textContent = question;
    btn.addEventListener("click", () => ask(question));
    els.quickQuestions.appendChild(btn);
  }
}

function renderDetectedSystems() {
  const text = collectSearchText().toLowerCase();
  const systems = [
    "flight", "beam", "heat vision", "speed", "suit", "injection",
    "compound", "cooldown", "hud", "regen", "strength", "durability",
    "glide", "hover", "boost", "animation", "particle"
  ].filter(word => text.includes(word));

  els.detectedSystems.innerHTML = "";
  for (const system of systems.slice(0, 22)) {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = system;
    chip.addEventListener("click", () => {
      els.searchInput.value = system;
      runSearch(system);
      ask(`Explain ${system}`);
    });
    els.detectedSystems.appendChild(chip);
  }
}

function renderGuideNotes() {
  els.guideNotes.innerHTML = "";

  const notes = [
    ...(knowledge.guides || []).slice(0, 4),
    ...(knowledge.catalog || []).slice(0, 3)
  ];

  if (!notes.length) {
    const div = document.createElement("div");
    div.className = "guide-note";
    div.innerHTML = `<strong>No guide files detected</strong><p>Add guide text to data/pack_knowledge.json to improve answers.</p>`;
    els.guideNotes.appendChild(div);
    return;
  }

  for (const note of notes) {
    const div = document.createElement("div");
    div.className = "guide-note";
    div.innerHTML = `
      <strong>${escapeHtml(note.file || "Guide Entry")}</strong>
      <p>${escapeHtml((note.text || "").slice(0, 260))}</p>
    `;
    els.guideNotes.appendChild(div);
  }
}

function collectSearchText() {
  return JSON.stringify(knowledge);
}

function renderChat() {
  els.chatWindow.innerHTML = "";

  if (!chat.length) {
    renderMessage("ai", "T.I.T.A.N initialized. Ask me how powers work, how they are obtained, what items exist, or which scripts control a system.");
    return;
  }

  for (const msg of chat) {
    renderMessage(msg.role, msg.content);
  }
}

function renderMessage(role, content) {
  const row = document.createElement("div");
  row.className = `message-row ${role === "user" ? "user" : "ai"}`;

  const box = document.createElement("div");
  box.className = "message";

  const meta = document.createElement("span");
  meta.className = "meta";
  meta.textContent = role === "user" ? "You" : role === "system" ? "System" : "T.I.T.A.N";

  const body = document.createElement("span");
  body.textContent = content;

  box.appendChild(meta);
  box.appendChild(body);
  row.appendChild(box);
  els.chatWindow.appendChild(row);
  els.chatWindow.scrollTop = els.chatWindow.scrollHeight;
}

function addMessage(role, content) {
  chat.push({ role, content });
  saveChat();
  renderMessage(role, content);
}

function clearChat() {
  chat = [];
  saveChat();
  renderChat();
}

function exportChat() {
  const text = chat.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
  const blob = new Blob([text], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "project-titan-chat.txt";
  link.click();
  URL.revokeObjectURL(link.href);
}

async function onSubmit(event) {
  event.preventDefault();
  const message = els.messageInput.value.trim();
  if (!message) return;
  els.messageInput.value = "";
  await ask(message);
}

async function ask(message) {
  addMessage("user", message);
  const typingId = showTyping();

  try {
    const reply = USE_BACKEND
      ? await askBackend(message)
      : await askLocalEngine(message);

    removeTyping(typingId);
    addMessage("ai", reply);
  } catch (err) {
    removeTyping(typingId);
    addMessage("system", `Error: ${err.message}`);
  }
}

function showTyping() {
  const id = `typing-${Date.now()}`;
  const row = document.createElement("div");
  row.id = id;
  row.className = "message-row ai";
  row.innerHTML = `<div class="message"><span class="meta">T.I.T.A.N</span><span>Scanning pack knowledge...</span></div>`;
  els.chatWindow.appendChild(row);
  els.chatWindow.scrollTop = els.chatWindow.scrollHeight;
  return id;
}

function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

async function askBackend(message) {
  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      memory: els.memoryBox.value.trim(),
      knowledgeSummary: {
        itemCount: knowledge.items.length,
        scriptCount: knowledge.scripts.length,
        powerCount: knowledge.powers.length
      },
      recentResults: searchAll(message).slice(0, 12),
      history: chat.slice(-10)
    })
  });

  if (!response.ok) throw new Error(`Backend error ${response.status}`);

  const data = await response.json();
  return data.reply || "No backend reply returned.";
}

async function askLocalEngine(message) {
  await delay(260);

  const lower = message.toLowerCase();
  const results = searchAll(message).slice(0, 8);

  if (lower.includes("obtain") || lower.includes("get ") || lower.includes("unlock") || lower.includes("craft")) {
    return answerObtainment(message, results);
  }

  if (lower.includes("how") && (lower.includes("work") || lower.includes("power"))) {
    return answerHowItWorks(message, results);
  }

  if (lower.includes("script") || lower.includes("file") || lower.includes("code")) {
    return answerFiles(message, results);
  }

  if (lower.includes("item") || lower.includes("id")) {
    return answerItems(message, results);
  }

  if (lower.includes("system") || lower.includes("detected")) {
    return answerDetectedSystems();
  }

  return answerGeneral(message, results);
}

function answerObtainment(message, results) {
  const matchingPowers = results.filter(r => r.type === "power");
  const matchingItems = results.filter(r => r.type === "item");

  let reply = "Obtainment scan:\n\n";

  if (matchingPowers.length) {
    reply += matchingPowers.map(r =>
      `• ${r.title}: ${r.raw.obtainment || "No exact obtainment method confirmed."}`
    ).join("\n");
  } else if (matchingItems.length) {
    reply += matchingItems.map(r =>
      `• ${r.title}${r.raw.id ? ` (${r.raw.id})` : ""}: likely obtained through the pack's item/suit/injection systems.`
    ).join("\n");
  } else {
    reply += "I do not have an exact unlock/crafting method for that yet. Search terms like injection, suit, compound, craft, or the specific power name.";
  }

  reply += "\n\nIf exact recipes are needed, add recipe JSON files or manual notes into data/pack_knowledge.json.";
  return reply;
}

function answerHowItWorks(message, results) {
  let reply = "Mechanic scan:\n\n";

  if (!results.length) {
    return "I could not find a direct match in the extracted pack data. Try searching a specific term like flight, beam, speed, suit, injection, or cooldown.";
  }

  for (const r of results.slice(0, 6)) {
    if (r.type === "power") {
      reply += `• ${r.title}: ${r.raw.howItWorks || "Detected through related files."}\n`;
      if (r.raw.relatedFiles?.length) reply += `  Files: ${r.raw.relatedFiles.slice(0, 4).join(", ")}\n`;
    } else if (r.type === "script") {
      reply += `• Script: ${r.title}\n`;
      if (r.raw.tags?.length) reply += `  Tags: ${r.raw.tags.join(", ")}\n`;
    } else {
      reply += `• ${r.type}: ${r.title}${r.raw.id ? ` (${r.raw.id})` : ""}\n`;
    }
  }

  return reply.trim();
}

function answerFiles(message, results) {
  const files = results.filter(r => r.raw.file).slice(0, 10);

  if (!files.length) {
    return "I could not find matching files. Try a narrower search like beam, flight, speed, injection, suit, or cooldown.";
  }

  return "Matching file references:\n\n" + files.map(r => `• [${r.type}] ${r.raw.file}`).join("\n");
}

function answerItems(message, results) {
  const items = results.filter(r => r.type === "item").slice(0, 12);

  if (!items.length) {
    return `I found ${knowledge.items.length} item definitions total, but no direct match for that query. Try searching item words like suit, injection, ability, speed, beam, or power.`;
  }

  return "Matching items:\n\n" + items.map(r => {
    const id = r.raw.id ? `\n  ID: ${r.raw.id}` : "";
    const cat = r.raw.category ? `\n  Category: ${r.raw.category}` : "";
    return `• ${r.title}${id}${cat}`;
  }).join("\n");
}

function answerDetectedSystems() {
  const chips = Array.from(els.detectedSystems.querySelectorAll(".chip")).map(c => c.textContent);
  return "Detected pack systems:\n\n" + (chips.length ? chips.map(x => `• ${x}`).join("\n") : "No systems detected yet.");
}

function answerGeneral(message, results) {
  if (!results.length) {
    return "I scanned the local pack knowledge but did not find a strong match. Try asking about a specific system: flight, beams, suits, injections, cooldowns, speed, strength, or item IDs.";
  }

  return "Closest matches:\n\n" + results.slice(0, 7).map(r => {
    const file = r.raw.file ? `\n  File: ${r.raw.file}` : "";
    const id = r.raw.id ? `\n  ID: ${r.raw.id}` : "";
    return `• [${r.type}] ${r.title}${id}${file}`;
  }).join("\n");
}

function runSearch(query) {
  const results = searchAll(query).slice(0, 28);
  els.searchResults.innerHTML = "";

  if (!results.length) {
    els.searchResults.innerHTML = `<div class="result-card"><strong>No results</strong><p>Try flight, beam, suit, injection, speed, cooldown, power, or item.</p></div>`;
    return;
  }

  for (const result of results) {
    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <span class="badge">${escapeHtml(result.type)}</span>
      <strong>${escapeHtml(result.title)}</strong>
      <p>${escapeHtml(result.description)}</p>
    `;
    card.addEventListener("click", () => ask(`Explain ${result.title}`));
    els.searchResults.appendChild(card);
  }
}

function searchAll(query) {
  const q = normalize(query);
  const all = [];

  if (activeFilter === "all" || activeFilter === "items") {
    for (const item of knowledge.items || []) {
      all.push({
        type: "item",
        title: item.name || item.id || shortFile(item.file),
        description: `${item.id || ""} ${item.category || ""} ${item.file || ""}`.trim(),
        raw: item
      });
    }
  }

  if (activeFilter === "all" || activeFilter === "scripts") {
    for (const script of knowledge.scripts || []) {
      all.push({
        type: "script",
        title: shortFile(script.file),
        description: `${script.file || ""} ${(script.tags || []).join(", ")}`.trim(),
        raw: script
      });
    }
  }

  if (activeFilter === "all" || activeFilter === "powers") {
    for (const power of knowledge.powers || []) {
      all.push({
        type: "power",
        title: power.name,
        description: `${power.howItWorks || ""} ${power.obtainment || ""}`.trim(),
        raw: power
      });
    }
  }

  if (activeFilter === "all") {
    for (const guide of [...(knowledge.guides || []), ...(knowledge.catalog || [])]) {
      all.push({
        type: "guide",
        title: shortFile(guide.file),
        description: guide.text || "",
        raw: guide
      });
    }
  }

  if (!q) return all.slice(0, 60);

  return all
    .map(entry => {
      const hay = normalize(`${entry.title} ${entry.description} ${JSON.stringify(entry.raw)}`);
      const score = scoreMatch(hay, q);
      return { ...entry, score };
    })
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score);
}

function scoreMatch(text, query) {
  const terms = query.split(" ").filter(Boolean);
  let score = 0;

  if (text.includes(query)) score += 12;

  for (const term of terms) {
    if (text.includes(term)) score += term.length > 3 ? 4 : 2;
  }

  return score;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[_\-:/\\.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shortFile(file) {
  if (!file) return "Unknown";
  return file.split("/").pop();
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

init();
