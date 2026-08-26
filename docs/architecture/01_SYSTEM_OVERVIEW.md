# Architecture: System Overview & Deployment Topography

This document outlines the high-level architecture, deployment infrastructure, network routing, and component boundaries of Parth Nautiyal's portfolio ecosystem.

---

## 1. High-Level System Architecture

![System Architecture Diagram](assets/01_system_architecture.svg)

<details>
<summary><b>View Mermaid Source Code</b></summary>

```mermaid
graph TD
    subgraph Client["Client Layer (Browser, Mobile, Terminal)"]
        UI["Angular 21 SPA (Tailwind CSS, RxJS)"]
        CLI["Developer Console (Interactive CLI)"]
        PDF["Interactive Resume & Fullscreen Viewer"]
        Jaeger["Distributed Career Trace (Jaeger Timeline)"]
    end

    subgraph Edge["Vercel Edge Network & CDN"]
        CDN["Vercel Global CDN (Static Assets)"]
        Router["Vercel Edge Router (Rewrites & Proxies)"]
        Serverless["Vercel Serverless Functions (/api/*)"]
    end

    subgraph Backend["Spring Boot Microservice (Render)"]
        SpringCore["Spring Boot 3.4.x (Java 21 Native)"]
        RAG["RAG Knowledge Engine & Vector Search"]
    end

    subgraph AI["Multi-LLM AI Providers"]
        Claude["Anthropic Claude 3.5"]
        Gemini["Google Gemini 2.5 Flash"]
        OpenAI["OpenAI GPT-4o-mini"]
        Ollama["Local Offline Ollama (Llama 3)"]
    end

    subgraph Resume["Single Source of Truth"]
        TeX["Overleaf LaTeX (Parth_Nautiyal_Resume.tex)"]
        Parser["Deterministic Parser (parse-resume-tex.js)"]
        TS["Generated TypeScript Content Models"]
    end

    UI --> CDN
    CLI --> Serverless
    PDF --> UI
    Jaeger --> UI

    Router --> CDN
    Router --> SpringCore
    Serverless --> Edge

    RAG --> Claude
    RAG --> Gemini
    RAG --> OpenAI
    RAG -.-> Ollama

    TeX --> Parser
    Parser --> TS
    TS --> UI
    TS --> Serverless
```

</details>

---

## 2. Request Routing & API Proxy Topography

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant Vercel as Vercel Edge Router
    participant Serverless as Vercel Serverless (/api/sync-resume)
    participant Render as Spring Boot Backend (Render)
    participant AI as AI Cloud (Gemini / Claude / OpenAI)

    User->>Vercel: GET /resume
    Vercel-->>User: 200 OK (Angular Static Chunks + Hydrated State)

    alt AI Chat or Contact Request
        User->>Vercel: POST /api/chat
        Vercel->>Render: Proxy to /api/chat
        Render->>AI: Context-Injected Inference Request
        AI-->>Render: Streamed Response
        Render-->>User: 200 OK { reply }
    else On-Demand Resume Rebuild
        User->>Vercel: POST /api/sync-resume { pin: "1721" }
        Vercel->>Serverless: Route to api/sync-resume.js
        Serverless->>Serverless: Verify ADMIN_PIN
        Serverless->>Vercel: Trigger Vercel Deploy Hook
        Vercel-->>User: 200 OK { success: true, message: "Build Queued" }
    end
```

---

## 3. Component & Module Topography

| Component Layer | Technologies Used | Core Responsibility |
| :--- | :--- | :--- |
| **Frontend UI** | Angular 21, Tailwind CSS v4, Lucide Icons, SimpleIcons | High-performance SPA with sub-second page transitions, reactive theme management, and full accessibility. |
| **Data Access Layer** | `contentLoader.ts`, `StorageAdapter` | Single responsibility data loader providing centralized typed access to resume models with automatic version eviction. |
| **Serverless Functions** | Node.js (Vercel Serverless) | Zero-overhead lightweight endpoints for GitHub profile scraping, resume deploy hook triggers, and AI job-matching scoring. |
| **Backend Core** | Spring Boot 3.4.x, Java 21, GraalVM Native Image | High-throughput microservice handling transactional email delivery, system health metrics, and multi-LLM orchestrations. |
| **Sync Pipeline** | `scripts/parse-resume-tex.js` | Zero-dependency deterministic parser transforming Overleaf LaTeX into strongly-typed TypeScript models during prebuild. |
