<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Project T.I.T.A.N Advanced</title>

  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="background-grid"></div>

  <main class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="logo">T</div>
        <div>
          <h1>Project T.I.T.A.N</h1>
          <p>Meta Core Companion</p>
        </div>
      </div>

      <div class="status-card">
        <span class="status-dot"></span>
        <div>
          <strong id="statusTitle">Knowledge Base Loading</strong>
          <p id="statusText">Reading pack data...</p>
        </div>
      </div>

      <nav class="tab-list">
        <button class="tab-button active" data-tab="chat">Companion Chat</button>
        <button class="tab-button" data-tab="knowledge">Knowledge Base</button>
        <button class="tab-button" data-tab="guide">Pack Guide</button>
        <button class="tab-button" data-tab="settings">Settings</button>
      </nav>

      <div class="panel">
        <h2>Ask Pack Questions</h2>
        <div id="starterQuestions" class="starter-list"></div>
      </div>

      <div class="panel">
        <h2>Local Memory</h2>
        <p class="small-text">Saved in this browser only.</p>
        <textarea id="memoryBox" placeholder="Example: Focus on my Meta Core addon systems."></textarea>
        <button id="saveMemoryButton" class="secondary-button">Save Memory</button>
      </div>
    </aside>

    <section class="main-panel">
      <section id="chatTab" class="tab-page active">
        <header class="topbar">
          <div>
            <h2 id="chatTitle">T.I.T.A.N</h2>
            <p id="chatSubtitle">Ask about powers, obtainment, items, scripts, tags, and mechanics.</p>
          </div>
          <div class="topbar-actions">
            <button id="exportChatButton" class="secondary-button">Export</button>
            <button id="clearChatButton" class="danger-button">Clear</button>
          </div>
        </header>

        <div id="chatWindow" class="chat-window" aria-live="polite"></div>

        <form id="chatForm" class="chat-form">
          <input
            id="messageInput"
            type="text"
            autocomplete="off"
            placeholder="Ask how a power works, how to obtain it, or which file controls it..."
          />
          <button type="submit">Send</button>
        </form>
      </section>

      <section id="knowledgeTab" class="tab-page">
        <header class="topbar">
          <div>
            <h2>Pack Knowledge Base</h2>
            <p>Search extracted items, abilities, scripts, tags, and catalog groups.</p>
          </div>
        </header>

        <div class="search-row">
          <input id="knowledgeSearch" type="text" placeholder="Search heat vision, flight, injection, speed, beam..." />
          <select id="knowledgeFilter">
            <option value="all">All</option>
            <option value="items">Items</option>
            <option value="abilities">Abilities/Scripts</option>
            <option value="groups">Groups</option>
          </select>
        </div>

        <div id="knowledgeStats" class="stats-grid"></div>
        <div id="knowledgeResults" class="results-grid"></div>
      </section>

      <section id="guideTab" class="tab-page">
        <header class="topbar">
          <div>
            <h2>Extracted Pack Guide</h2>
            <p>Generated from the uploaded pack's guide script.</p>
          </div>
        </header>

        <div id="guideResults" class="guide-list"></div>
      </section>

      <section id="settingsTab" class="tab-page">
        <header class="topbar">
          <div>
            <h2>Companion Settings</h2>
            <p>Change the local companion style.</p>
          </div>
        </header>

        <div class="settings-grid">
          <div class="panel solid">
            <h2>Identity</h2>

            <label for="companionName">Companion Name</label>
            <input id="companionName" type="text" value="T.I.T.A.N" />

            <label for="companionTone">Tone</label>
            <select id="companionTone">
              <option value="balanced">Balanced</option>
              <option value="technical">Technical</option>
              <option value="direct">Direct</option>
              <option value="friendly">Friendly</option>
              <option value="addon-dev">Addon Developer</option>
            </select>

            <button id="saveSettingsButton" class="secondary-button">Save Settings</button>
          </div>

          <div class="panel solid">
            <h2>Backend Mode</h2>
            <p class="small-text">
              This frontend works offline from the extracted pack data. For real AI, deploy the backend folder and edit the constants at the top of script.js.
            </p>
            <pre><code>const USE_BACKEND = false;
const BACKEND_URL = "https://your-backend-url.com/chat";</code></pre>
          </div>

          <div class="panel solid">
            <h2>PC Opening Help</h2>
            <p>
              Double-click <strong>index.html</strong> to open it. If the knowledge base does not load, open Command Prompt in the folder and run:
            </p>
            <pre><code>python -m http.server 8080</code></pre>
            <p>Then go to:</p>
            <pre><code>http://localhost:8080</code></pre>
          </div>
        </div>
      </section>
    </section>
  </main>

  <script src="script.js"></script>
</body>
</html>
