const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'docs', 'architecture', 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

// 1. System Overview SVG
const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 620" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9"/>
    </linearGradient>
  </defs>

  <rect width="960" height="620" rx="16" fill="url(#bgGrad)" stroke="#334155" stroke-width="1.5"/>

  <!-- Title Header -->
  <text x="480" y="38" text-anchor="middle" fill="#f8fafc" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" letter-spacing="0.5">PARTH NAUTIYAL — PORTFOLIO SYSTEM ARCHITECTURE</text>
  <line x1="40" y1="52" x2="920" y2="52" stroke="#334155" stroke-dasharray="4 4"/>

  <!-- Layer 1: Client Layer -->
  <rect x="40" y="70" width="880" height="105" rx="10" fill="url(#cardGrad)" stroke="#38bdf8" stroke-width="1.5"/>
  <rect x="40" y="70" width="880" height="26" rx="10" fill="#0284c7" fill-opacity="0.25"/>
  <text x="55" y="88" fill="#38bdf8" font-family="sans-serif" font-size="13" font-weight="700">CLIENT LAYER (Browser &amp; Devices)</text>
  
  <rect x="55" y="105" width="190" height="55" rx="6" fill="#0f172a" stroke="#0284c7" stroke-width="1"/>
  <text x="150" y="127" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="600">Angular 21 SPA</text>
  <text x="150" y="145" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Signals · Tailwind v4 · Lucide</text>

  <rect x="260" y="105" width="200" height="55" rx="6" fill="#0f172a" stroke="#0284c7" stroke-width="1"/>
  <text x="360" y="127" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="600">Developer Console (CLI)</text>
  <text x="360" y="145" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Anywhere Focus · PIN Sync</text>

  <rect x="475" y="105" width="205" height="55" rx="6" fill="#0f172a" stroke="#0284c7" stroke-width="1"/>
  <text x="577" y="127" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="600">Interactive Resume &amp; PDF</text>
  <text x="577" y="145" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Role Highlight · Deep Links</text>

  <rect x="695" y="105" width="210" height="55" rx="6" fill="#0f172a" stroke="#0284c7" stroke-width="1"/>
  <text x="800" y="127" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="600">Distributed Jaeger Trace</text>
  <text x="800" y="145" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Career Timeline · Quest XP</text>

  <!-- Connectors from Client to Edge -->
  <path d="M 150 175 L 150 205" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 3"/>
  <path d="M 360 175 L 360 205" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 3"/>
  <path d="M 577 175 L 577 205" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 3"/>
  <path d="M 800 175 L 800 205" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 3"/>

  <!-- Layer 2: Vercel Edge & Serverless -->
  <rect x="40" y="205" width="880" height="105" rx="10" fill="url(#cardGrad)" stroke="#10b981" stroke-width="1.5"/>
  <rect x="40" y="205" width="880" height="26" rx="10" fill="#059669" fill-opacity="0.25"/>
  <text x="55" y="223" fill="#34d399" font-family="sans-serif" font-size="13" font-weight="700">VERCEL EDGE &amp; SERVERLESS APIS</text>

  <rect x="55" y="240" width="260" height="55" rx="6" fill="#0f172a" stroke="#059669" stroke-width="1"/>
  <text x="185" y="262" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="600">Global Edge CDN</text>
  <text x="185" y="280" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Static Chunks · Sub-second TTFB</text>

  <rect x="330" y="240" width="280" height="55" rx="6" fill="#0f172a" stroke="#059669" stroke-width="1"/>
  <text x="470" y="262" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="600">/api/sync-resume (Serverless)</text>
  <text x="470" y="280" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">PIN Auth · Vercel Deploy Hook</text>

  <rect x="625" y="240" width="280" height="55" rx="6" fill="#0f172a" stroke="#059669" stroke-width="1"/>
  <text x="765" y="262" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="600">Reverse Proxy (/api/*)</text>
  <text x="765" y="280" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Forwarding to Render Backend</text>

  <!-- Connectors from Edge to Backend/AI -->
  <path d="M 470 310 L 470 345" stroke="#10b981" stroke-width="2" stroke-dasharray="3 3"/>
  <path d="M 765 310 L 765 345" stroke="#10b981" stroke-width="2" stroke-dasharray="3 3"/>

  <!-- Layer 3: Backend & Microservices -->
  <rect x="40" y="345" width="425" height="115" rx="10" fill="url(#cardGrad)" stroke="#a855f7" stroke-width="1.5"/>
  <rect x="40" y="345" width="425" height="26" rx="10" fill="#7c3aed" fill-opacity="0.25"/>
  <text x="55" y="363" fill="#c084fc" font-family="sans-serif" font-size="13" font-weight="700">SPRING BOOT 3.4.x (RENDER NATIVE)</text>

  <rect x="55" y="380" width="185" height="65" rx="6" fill="#0f172a" stroke="#a855f7" stroke-width="1"/>
  <text x="147" y="405" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="600">Core REST &amp; Mailer</text>
  <text x="147" y="425" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Java 21 · WebClient</text>

  <rect x="255" y="380" width="195" height="65" rx="6" fill="#0f172a" stroke="#a855f7" stroke-width="1"/>
  <text x="352" y="405" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="600">RAG Context Engine</text>
  <text x="352" y="425" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Vector Injection &amp; Memory</text>

  <!-- Layer 3 Right: Multi-LLM Cloud -->
  <rect x="495" y="345" width="425" height="115" rx="10" fill="url(#cardGrad)" stroke="#f97316" stroke-width="1.5"/>
  <rect x="495" y="345" width="425" height="26" rx="10" fill="#ea580c" fill-opacity="0.25"/>
  <text x="510" y="363" fill="#fb923c" font-family="sans-serif" font-size="13" font-weight="700">MULTI-LLM AI ORCHESTRATION</text>

  <rect x="510" y="380" width="90" height="65" rx="6" fill="#0f172a" stroke="#f97316" stroke-width="1"/>
  <text x="555" y="408" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11" font-weight="600">Gemini 2.5</text>
  <text x="555" y="426" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Primary</text>

  <rect x="612" y="380" width="90" height="65" rx="6" fill="#0f172a" stroke="#f97316" stroke-width="1"/>
  <text x="657" y="408" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11" font-weight="600">Claude 3.5</text>
  <text x="657" y="426" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Anthropic</text>

  <rect x="714" y="380" width="90" height="65" rx="6" fill="#0f172a" stroke="#f97316" stroke-width="1"/>
  <text x="759" y="408" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11" font-weight="600">GPT-4o</text>
  <text x="759" y="426" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">OpenAI</text>

  <rect x="816" y="380" width="90" height="65" rx="6" fill="#0f172a" stroke="#f97316" stroke-width="1"/>
  <text x="861" y="408" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11" font-weight="600">Ollama</text>
  <text x="861" y="426" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="9">Offline Llama</text>

  <!-- Layer 4: Resume Pipeline -->
  <rect x="40" y="480" width="880" height="115" rx="10" fill="url(#cardGrad)" stroke="#eab308" stroke-width="1.5"/>
  <rect x="40" y="480" width="880" height="26" rx="10" fill="#ca8a04" fill-opacity="0.25"/>
  <text x="55" y="498" fill="#facc15" font-family="sans-serif" font-size="13" font-weight="700">OVERLEAF LATEX SOURCE OF TRUTH PIPELINE</text>

  <rect x="55" y="515" width="240" height="65" rx="6" fill="#0f172a" stroke="#eab308" stroke-width="1"/>
  <text x="175" y="540" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="600">Parth_Nautiyal_Resume.tex</text>
  <text x="175" y="560" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Overleaf Cloud &amp; Git Source</text>

  <text x="310" y="552" fill="#facc15" font-family="sans-serif" font-size="16" font-weight="700">→</text>

  <rect x="335" y="515" width="240" height="65" rx="6" fill="#0f172a" stroke="#eab308" stroke-width="1"/>
  <text x="455" y="540" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="600">scripts/parse-resume-tex.js</text>
  <text x="455" y="560" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Deterministic Prebuild Parser</text>

  <text x="590" y="552" fill="#facc15" font-family="sans-serif" font-size="16" font-weight="700">→</text>

  <rect x="615" y="515" width="290" height="65" rx="6" fill="#0f172a" stroke="#eab308" stroke-width="1"/>
  <text x="760" y="540" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="600">Typed Models (*.ts)</text>
  <text x="760" y="560" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">personal, experience, projects, skills, edu</text>

</svg>`;

// 2. Resume Sync Pipeline SVG
const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 480" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="cardGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9"/>
    </linearGradient>
  </defs>

  <rect width="960" height="480" rx="16" fill="url(#bgGrad2)" stroke="#334155" stroke-width="1.5"/>
  <text x="480" y="38" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="18" font-weight="700">LATEX RESUME SYNCHRONIZATION PIPELINE</text>
  <line x1="40" y1="52" x2="920" y2="52" stroke="#334155" stroke-dasharray="4 4"/>

  <!-- Step 1: Overleaf Source -->
  <rect x="40" y="75" width="260" height="150" rx="10" fill="url(#cardGrad2)" stroke="#facc15" stroke-width="1.5"/>
  <text x="170" y="105" text-anchor="middle" fill="#facc15" font-family="sans-serif" font-size="14" font-weight="700">1. Resume Authoring</text>
  <rect x="55" y="125" width="230" height="80" rx="6" fill="#0f172a" stroke="#ca8a04" stroke-width="1"/>
  <text x="170" y="152" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="12" font-weight="600">Parth_Nautiyal_Resume.tex</text>
  <text x="170" y="172" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">Overleaf LaTeX Source</text>
  <text x="170" y="190" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="10">Single Source of Truth</text>

  <!-- Arrow 1 to 2 -->
  <path d="M 300 150 L 350 150" stroke="#facc15" stroke-width="2.5" marker-end="url(#arrow)"/>
  <text x="325" y="142" text-anchor="middle" fill="#facc15" font-family="sans-serif" font-size="16" font-weight="700">→</text>

  <!-- Step 2: Trigger Channels -->
  <rect x="350" y="75" width="260" height="150" rx="10" fill="url(#cardGrad2)" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="480" y="105" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="14" font-weight="700">2. Trigger Channels</text>
  <rect x="365" y="125" width="230" height="26" rx="4" fill="#0f172a" stroke="#0284c7" stroke-width="1"/>
  <text x="480" y="142" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="10">Option A: Git Push (main)</text>
  <rect x="365" y="155" width="230" height="26" rx="4" fill="#0f172a" stroke="#0284c7" stroke-width="1"/>
  <text x="480" y="172" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="10">Option B: CLI (sync-resume --pin 1721)</text>
  <rect x="365" y="185" width="230" height="26" rx="4" fill="#0f172a" stroke="#0284c7" stroke-width="1"/>
  <text x="480" y="202" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="10">Option C: GitHub Action Workflow</text>

  <!-- Arrow 2 to 3 -->
  <text x="635" y="142" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="16" font-weight="700">→</text>

  <!-- Step 3: Vercel Prebuild -->
  <rect x="660" y="75" width="260" height="150" rx="10" fill="url(#cardGrad2)" stroke="#10b981" stroke-width="1.5"/>
  <text x="790" y="105" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="14" font-weight="700">3. Vercel Prebuild &amp; Parse</text>
  <rect x="675" y="125" width="230" height="80" rx="6" fill="#0f172a" stroke="#059669" stroke-width="1"/>
  <text x="790" y="152" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="12" font-weight="600">scripts/parse-resume-tex.js</text>
  <text x="790" y="172" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">Regex Macro Stripping</text>
  <text x="790" y="190" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="10">Generates 5 Type-Safe TS Files</text>

  <!-- Bottom Section: Live Site Rendering -->
  <rect x="40" y="255" width="880" height="195" rx="10" fill="url(#cardGrad2)" stroke="#a855f7" stroke-width="1.5"/>
  <text x="480" y="285" text-anchor="middle" fill="#c084fc" font-family="sans-serif" font-size="14" font-weight="700">4. Live Application Hydration Across the Entire Website</text>
  
  <rect x="55" y="305" width="160" height="120" rx="6" fill="#0f172a" stroke="#7c3aed" stroke-width="1"/>
  <text x="135" y="335" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="600">Interactive Resume</text>
  <text x="135" y="360" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Deep Linking</text>
  <text x="135" y="380" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Role Highlight</text>
  <text x="135" y="400" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">PDF Modal</text>

  <rect x="230" y="305" width="160" height="120" rx="6" fill="#0f172a" stroke="#7c3aed" stroke-width="1"/>
  <text x="310" y="335" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="12" font-weight="600">Jaeger Trace</text>
  <text x="310" y="360" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">SDE II &amp; I Spans</text>
  <text x="310" y="380" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Latency Metrics</text>
  <text x="310" y="400" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Promotion History</text>

  <rect x="405" y="305" width="160" height="120" rx="6" fill="#0f172a" stroke="#7c3aed" stroke-width="1"/>
  <text x="485" y="335" text-anchor="middle" fill="#fb923c" font-family="sans-serif" font-size="12" font-weight="600">Technical Skills</text>
  <text x="485" y="360" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">6 Categorized Grids</text>
  <text x="485" y="380" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">SimpleIcons Match</text>
  <text x="485" y="400" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Brand Colors</text>

  <rect x="580" y="305" width="160" height="120" rx="6" fill="#0f172a" stroke="#7c3aed" stroke-width="1"/>
  <text x="660" y="335" text-anchor="middle" fill="#facc15" font-family="sans-serif" font-size="12" font-weight="600">Developer CLI</text>
  <text x="660" y="360" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">whoami &amp; cat exp</text>
  <text x="660" y="380" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Autocomplete</text>
  <text x="660" y="400" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">sync-resume</text>

  <rect x="755" y="305" width="150" height="120" rx="6" fill="#0f172a" stroke="#7c3aed" stroke-width="1"/>
  <text x="830" y="335" text-anchor="middle" fill="#f43f5e" font-family="sans-serif" font-size="12" font-weight="600">RAG Chatbot</text>
  <text x="830" y="360" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Ground-truth Context</text>
  <text x="830" y="380" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">AI Job Match</text>
  <text x="830" y="400" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Multi-LLM</text>

</svg>`;

// 3. Interactive Features SVG
const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 480" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="cardGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9"/>
    </linearGradient>
  </defs>

  <rect width="960" height="480" rx="16" fill="url(#bgGrad3)" stroke="#334155" stroke-width="1.5"/>
  <text x="480" y="38" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="18" font-weight="700">INTERACTIVE FEATURES &amp; STATE MANAGEMENT</text>
  <line x1="40" y1="52" x2="920" y2="52" stroke="#334155" stroke-dasharray="4 4"/>

  <!-- Left: Developer Console State Machine -->
  <rect x="40" y="75" width="425" height="370" rx="10" fill="url(#cardGrad3)" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="252" y="105" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="14" font-weight="700">Developer Console (macOS-Style CLI)</text>

  <rect x="65" y="130" width="170" height="45" rx="6" fill="#0f172a" stroke="#0284c7" stroke-width="1"/>
  <text x="150" y="157" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="600">1. Closed State</text>

  <text x="250" y="157" fill="#38bdf8" font-family="sans-serif" font-size="14" font-weight="700">⇄</text>

  <rect x="270" y="130" width="170" height="45" rx="6" fill="#0f172a" stroke="#0284c7" stroke-width="1"/>
  <text x="355" y="157" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="600">2. Floating Window</text>

  <rect x="65" y="200" width="170" height="45" rx="6" fill="#0f172a" stroke="#0284c7" stroke-width="1"/>
  <text x="150" y="227" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="600">3. Minimized Pill</text>

  <text x="250" y="227" fill="#38bdf8" font-family="sans-serif" font-size="14" font-weight="700">⇄</text>

  <rect x="270" y="200" width="170" height="45" rx="6" fill="#0f172a" stroke="#0284c7" stroke-width="1"/>
  <text x="355" y="227" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12" font-weight="600">4. Fullscreen Mode</text>

  <rect x="65" y="270" width="375" height="150" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1"/>
  <text x="80" y="295" fill="#facc15" font-family="sans-serif" font-size="11" font-weight="700">Supported CLI Command Categories:</text>
  <text x="80" y="320" fill="#94a3b8" font-family="sans-serif" font-size="10">• Navigation: resume, system, projects, chat</text>
  <text x="80" y="340" fill="#94a3b8" font-family="sans-serif" font-size="10">• Data: whoami, about, exp, skills, education, cat</text>
  <text x="80" y="360" fill="#94a3b8" font-family="sans-serif" font-size="10">• Admin: sync-resume --pin 1721 [--set-pin / --set-hook]</text>
  <text x="80" y="380" fill="#94a3b8" font-family="sans-serif" font-size="10">• System: ping, quest, matrix, joke, clear, history</text>
  <text x="80" y="400" fill="#34d399" font-family="sans-serif" font-size="10">Features: Anywhere focus · Tab autocomplete · Double-click maximize</text>

  <!-- Right: Quest & Interactive Tokenizer -->
  <rect x="495" y="75" width="425" height="370" rx="10" fill="url(#cardGrad3)" stroke="#a855f7" stroke-width="1.5"/>
  <text x="707" y="105" text-anchor="middle" fill="#c084fc" font-family="sans-serif" font-size="14" font-weight="700">Zone-Safe State &amp; Quest Gamification</text>

  <rect x="520" y="130" width="375" height="135" rx="6" fill="#0f172a" stroke="#7c3aed" stroke-width="1"/>
  <text x="535" y="155" fill="#38bdf8" font-family="sans-serif" font-size="12" font-weight="700">Zone-Safe Angular Change Detection</text>
  <text x="535" y="180" fill="#94a3b8" font-family="sans-serif" font-size="10">• NgZone.run(): Wraps async button handlers &amp; reset timers</text>
  <text x="535" y="200" fill="#94a3b8" font-family="sans-serif" font-size="10">• ChangeDetectorRef.markForCheck(): Instant UI re-render</text>
  <text x="535" y="220" fill="#94a3b8" font-family="sans-serif" font-size="10">• Click-Outside Detection: Backdrop event isolation for PDF</text>
  <text x="535" y="240" fill="#34d399" font-family="sans-serif" font-size="10">Fixes repeat-click &amp; persistent fullscreen navigation bugs</text>

  <rect x="520" y="280" width="375" height="140" rx="6" fill="#0f172a" stroke="#7c3aed" stroke-width="1"/>
  <text x="535" y="305" fill="#facc15" font-family="sans-serif" font-size="12" font-weight="700">Quest &amp; Achievement System (QuestService)</text>
  <text x="535" y="330" fill="#94a3b8" font-family="sans-serif" font-size="10">• 10+ Interactive Developer Achievements to unlock</text>
  <text x="535" y="350" fill="#94a3b8" font-family="sans-serif" font-size="10">• Level Progression: Novice Recruit → Systems Architect</text>
  <text x="535" y="370" fill="#94a3b8" font-family="sans-serif" font-size="10">• Reactive Signals: Header XP pill &amp; toast alerts</text>
  <text x="535" y="390" fill="#c084fc" font-family="sans-serif" font-size="10">• Persistent state stored in localStorage</text>

</svg>`;

// 4. AI & Microservices SVG
const svg4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 480" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad4" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="cardGrad4" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9"/>
    </linearGradient>
  </defs>

  <rect width="960" height="480" rx="16" fill="url(#bgGrad4)" stroke="#334155" stroke-width="1.5"/>
  <text x="480" y="38" text-anchor="middle" fill="#f8fafc" font-family="sans-serif" font-size="18" font-weight="700">MULTI-LLM RAG &amp; DISTRIBUTED MICROSERVICES</text>
  <line x1="40" y1="52" x2="920" y2="52" stroke="#334155" stroke-dasharray="4 4"/>

  <!-- Left: Multi-LLM RAG Architecture -->
  <rect x="40" y="75" width="425" height="370" rx="10" fill="url(#cardGrad4)" stroke="#f97316" stroke-width="1.5"/>
  <text x="252" y="105" text-anchor="middle" fill="#fb923c" font-family="sans-serif" font-size="14" font-weight="700">Multi-LLM RAG Chatbot Engine</text>

  <rect x="65" y="125" width="375" height="45" rx="6" fill="#0f172a" stroke="#ea580c" stroke-width="1"/>
  <text x="252" y="152" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11" font-weight="600">1. User Query (Recruiter / Visitor Prompt)</text>

  <text x="252" y="185" text-anchor="middle" fill="#f97316" font-family="sans-serif" font-size="14" font-weight="700">↓</text>

  <rect x="65" y="195" width="375" height="45" rx="6" fill="#0f172a" stroke="#ea580c" stroke-width="1"/>
  <text x="252" y="222" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="11" font-weight="600">2. Vector Search &amp; Ground-Truth Resume Context</text>

  <text x="252" y="255" text-anchor="middle" fill="#f97316" font-family="sans-serif" font-size="14" font-weight="700">↓</text>

  <rect x="65" y="265" width="375" height="70" rx="6" fill="#0f172a" stroke="#ea580c" stroke-width="1"/>
  <text x="252" y="290" text-anchor="middle" fill="#facc15" font-family="sans-serif" font-size="11" font-weight="700">3. Multi-Provider Fallback Dispatcher</text>
  <text x="252" y="315" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Claude 3.5 · Gemini 2.5 Flash · GPT-4o · Offline Ollama</text>

  <text x="252" y="352" text-anchor="middle" fill="#f97316" font-family="sans-serif" font-size="14" font-weight="700">↓</text>

  <rect x="65" y="360" width="375" height="45" rx="6" fill="#0f172a" stroke="#ea580c" stroke-width="1"/>
  <text x="252" y="387" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="600">4. Streamed Contextual Response to Frontend</text>

  <!-- Right: Microservices & Event Stream -->
  <rect x="495" y="75" width="425" height="370" rx="10" fill="url(#cardGrad4)" stroke="#10b981" stroke-width="1.5"/>
  <text x="707" y="105" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="14" font-weight="700">Distributed Microservices Architecture</text>

  <rect x="520" y="125" width="375" height="50" rx="6" fill="#0f172a" stroke="#059669" stroke-width="1"/>
  <text x="707" y="148" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="11" font-weight="700">Apache Kafka Event Streaming</text>
  <text x="707" y="165" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Partitioned Ingest Topics · 50% Latency Reduction · DLQ</text>

  <rect x="520" y="185" width="375" height="50" rx="6" fill="#0f172a" stroke="#059669" stroke-width="1"/>
  <text x="707" y="208" text-anchor="middle" fill="#facc15" font-family="sans-serif" font-size="11" font-weight="700">Temporal Workflow Orchestration</text>
  <text x="707" y="225" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">11+ Activities · Replay Safety · Idempotent Execution</text>

  <rect x="520" y="245" width="375" height="50" rx="6" fill="#0f172a" stroke="#059669" stroke-width="1"/>
  <text x="707" y="268" text-anchor="middle" fill="#c084fc" font-family="sans-serif" font-size="11" font-weight="700">Polyglot Persistence Layer</text>
  <text x="707" y="285" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">PostgreSQL Transactional Store · Redis In-Memory Cache</text>

  <rect x="520" y="305" width="375" height="50" rx="6" fill="#0f172a" stroke="#059669" stroke-width="1"/>
  <text x="707" y="328" text-anchor="middle" fill="#f43f5e" font-family="sans-serif" font-size="11" font-weight="700">Observability &amp; Telemetry</text>
  <text x="707" y="345" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="10">Prometheus Actuators · Grafana Dashboards · Datadog</text>

  <rect x="520" y="365" width="375" height="45" rx="6" fill="#0f172a" stroke="#059669" stroke-width="1"/>
  <text x="707" y="392" text-anchor="middle" fill="#34d399" font-family="sans-serif" font-size="11" font-weight="700">Spring Boot 3.4.x Native (Java 21)</text>

</svg>`;

fs.writeFileSync(path.join(assetsDir, '01_system_architecture.svg'), svg1, 'utf8');
fs.writeFileSync(path.join(assetsDir, '02_resume_sync_pipeline.svg'), svg2, 'utf8');
fs.writeFileSync(path.join(assetsDir, '03_interactive_features.svg'), svg3, 'utf8');
fs.writeFileSync(path.join(assetsDir, '04_ai_and_microservices.svg'), svg4, 'utf8');

console.log('All 4 Architecture SVGs generated successfully in docs/architecture/assets/');
