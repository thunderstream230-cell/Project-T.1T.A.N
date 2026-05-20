/*
  Project T.I.T.A.N frontend

  This file works immediately in local demo mode.

  To use a real AI backend:
  1. Deploy the backend folder somewhere like Vercel, Render, or Railway.
  2. Set USE_BACKEND to true.
  3. Set BACKEND_URL to your deployed backend /chat endpoint.

  Never put your API key in this browser file.
*/

const USE_BACKEND = false;
const BACKEND_URL = "https://your-backend-url.com/chat";

const STORAGE_KEYS = {
  chat: "project_titan_chat",
  memory: "project_titan_memory",
  settings: "project_titan_settings"
};

const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const memoryBox = document.getElementById("memoryBox");
const companionNameInput = document.getElementById("companionName");
const companionToneInput = document.getElementById("companionTone");
const saveMemoryButton = document.getElementById("saveMemoryButton");
const saveSettingsButton = document.getElementById("saveSettingsButton");
const clearChatButton = document.getElementById("clearChatButton");
const exportChatButton = document.getElementById("exportChatButton");
const chatTitle = document.getElementById("chatTitle");
const chatSubtitle = document.getElementById("chatSubtitle");
const modeLabel = document.getElementById("modeLabel");

let companionConfig = {
  name: "T.I.T.A.N",
  subtitle: "Tactical Interactive Thought Assistant Network",
  personality: "Calm, loyal, helpful, slightly witty, direct, and protective without pretending to be human.",
  demoResponses: [
    "I'm here. Tell me what you want to work on.",
    "Understood. We can build this step by step.",
    "That makes sense. I’ll help you organize it.",
    "I’m tracking the idea. What’s the next piece?",
    "Good. Let’s make it cleaner and more useful."
  ]
};

let chatHistory = [];

async function loadCompanionConfig() {
  try {
    const response = await fetch("companion.json");
    if (!response.ok) return;

    const data = await response.json();
    companionConfig = {
      ...companionConfig,
      ...data
    };
  } catch {
    // GitHub Pages/local file fallback is fine.
  }
}

function loadState() {
  const savedChat = localStorage.getItem(STORAGE_KEYS.chat);
  const savedMemory = localStorage.getItem(STORAGE_KEYS.memory);
  const savedSettings = localStorage.getItem(STORAGE_KEYS.settings);

  if (savedChat) {
    try {
      chatHistory = JSON.parse(savedChat);
    } catch {
      chatHistory = [];
    }
  }

  if (savedMemory) {
    memoryBox.value = savedMemory;
  }

  if (savedSettings) {
    try {
      const settings = JSON.parse(savedSettings);

      if (settings.name) {
        companionNameInput.value = settings.name;
      }

      if (settings.tone) {
        companionToneInput.value = settings.tone;
      }
    } catch {
      // Ignore bad local data.
    }
  } else {
    companionNameInput.value = companionConfig.name;
  }
}

function saveChat() {
  localStorage.setItem(STORAGE_KEYS.chat, JSON.stringify(chatHistory));
}

function saveSettings() {
  const settings = {
    name: companionNameInput.value.trim() || companionConfig.name,
    tone: companionToneInput.value
  };

  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  applySettings();

  addMessage("system", "Settings saved.");
}

function saveMemory() {
  localStorage.setItem(STORAGE_KEYS.memory, memoryBox.value.trim());
  addMessage("system", "Memory saved locally.");
}

function applySettings() {
  const name = companionNameInput.value.trim() || companionConfig.name;
  const tone = companionToneInput.value;

  chatTitle.textContent = name;
  chatSubtitle.textContent = `${companionConfig.subtitle} • ${tone} mode`;
  modeLabel.textContent = USE_BACKEND ? "Backend AI mode" : "Local demo mode";
}

function renderChat() {
  chatWindow.innerHTML = "";

  if (chatHistory.length === 0) {
    addMessage("ai", `System initialized. I am ${companionNameInput.value || companionConfig.name}. What are we building today?`, false);
    return;
  }

  for (const item of chatHistory) {
    renderMessage(item.role, item.content);
  }

  scrollToBottom();
}

function renderMessage(role, content) {
  const row = document.createElement("div");
  row.className = `message-row ${role === "user" ? "user" : "ai"}`;

  const bubble = document.createElement("div");
  bubble.className = "message";

  const meta = document.createElement("span");
  meta.className = "meta";

  if (role === "user") {
    meta.textContent = "You";
  } else if (role === "system") {
    meta.textContent = "System";
  } else {
    meta.textContent = companionNameInput.value.trim() || companionConfig.name;
  }

  const text = document.createElement("span");
  text.textContent = content;

  bubble.appendChild(meta);
  bubble.appendChild(text);
  row.appendChild(bubble);
  chatWindow.appendChild(row);
}

function addMessage(role, content, shouldSave = true) {
  if (shouldSave) {
    chatHistory.push({ role, content });
    saveChat();
  }

  renderMessage(role, content);
  scrollToBottom();
}

function scrollToBottom() {
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function buildLocalPrompt(userMessage) {
  const memory = memoryBox.value.trim();
  const tone = companionToneInput.value;
  const name = companionNameInput.value.trim() || companionConfig.name;

  return {
    name,
    tone,
    memory,
    userMessage
  };
}

function getDemoResponse(userMessage) {
  const prompt = buildLocalPrompt(userMessage);
  const lower = userMessage.toLowerCase();

  if (lower.includes("github") || lower.includes("repo")) {
    return "For the repo, keep the frontend on GitHub Pages and use a separate backend for real AI calls. That keeps your API key private.";
  }

  if (lower.includes("minecraft") || lower.includes("addon")) {
    return "For your Minecraft addon work, I’d keep systems modular: core handles shared player files, while hero packs provide data, items, textures, and scripts where possible.";
  }

  if (lower.includes("remember")) {
    return "I can use the local memory box on the left. Add what you want me to remember there, then press Save Memory.";
  }

  if (lower.includes("voice")) {
    return "Voice support can be added with the browser Speech Recognition API, but it works better in Chrome-based browsers than everywhere else.";
  }

  const responses = companionConfig.demoResponses || [];
  const index = Math.abs(hashString(`${prompt.tone}:${userMessage}`)) % responses.length;

  let response = responses[index] || "I’m here. Keep going.";

  if (prompt.memory) {
    response += "\n\nI also see your saved local memory, so I can use that as context while this browser keeps it.";
  }

  return response;
}

function hashString(value) {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash) + value.charCodeAt(i);
    hash |= 0;
  }

  return hash;
}

async function getAiResponse(userMessage) {
  if (!USE_BACKEND) {
    await delay(450);
    return getDemoResponse(userMessage);
  }

  const payload = {
    message: userMessage,
    history: chatHistory.slice(-12),
    memory: memoryBox.value.trim(),
    companion: {
      name: companionNameInput.value.trim() || companionConfig.name,
      tone: companionToneInput.value,
      personality: companionConfig.personality
    }
  };

  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Backend error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.reply) {
    throw new Error("Backend returned no reply.");
  }

  return data.reply;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function handleSubmit(event) {
  event.preventDefault();

  const userMessage = messageInput.value.trim();
  if (!userMessage) return;

  messageInput.value = "";
  addMessage("user", userMessage);

  const typingId = showTyping();

  try {
    const aiResponse = await getAiResponse(userMessage);
    removeTyping(typingId);
    addMessage("ai", aiResponse);
  } catch (error) {
    removeTyping(typingId);
    addMessage("system", `Error: ${error.message}`);
  }
}

function showTyping() {
  const id = `typing-${Date.now()}`;

  const row = document.createElement("div");
  row.className = "message-row ai";
  row.id = id;

  const bubble = document.createElement("div");
  bubble.className = "message";

  const meta = document.createElement("span");
  meta.className = "meta";
  meta.textContent = companionNameInput.value.trim() || companionConfig.name;

  const text = document.createElement("span");
  text.textContent = "Thinking...";

  bubble.appendChild(meta);
  bubble.appendChild(text);
  row.appendChild(bubble);
  chatWindow.appendChild(row);
  scrollToBottom();

  return id;
}

function removeTyping(id) {
  const element = document.getElementById(id);
  if (element) element.remove();
}

function clearChat() {
  chatHistory = [];
  saveChat();
  renderChat();
}

function exportChat() {
  const content = chatHistory
    .map(item => `${item.role.toUpperCase()}: ${item.content}`)
    .join("\n\n");

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "project-titan-chat.txt";
  link.click();

  URL.revokeObjectURL(url);
}

async function init() {
  await loadCompanionConfig();
  loadState();
  applySettings();
  renderChat();

  chatForm.addEventListener("submit", handleSubmit);
  saveMemoryButton.addEventListener("click", saveMemory);
  saveSettingsButton.addEventListener("click", saveSettings);
  clearChatButton.addEventListener("click", clearChat);
  exportChatButton.addEventListener("click", exportChat);
}

init();
