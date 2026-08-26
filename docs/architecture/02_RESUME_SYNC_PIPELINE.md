# Architecture: Overleaf / LaTeX Synchronization Pipeline

This document explains the end-to-end synchronization pipeline that establishes `Parth_Nautiyal_Resume.tex` as the single source of truth across the entire portfolio.

---

## 1. Complete Synchronization Workflow

![Resume Synchronization Pipeline](assets/02_resume_sync_pipeline.svg)

<details>
<summary><b>View Mermaid Source Code</b></summary>

```mermaid
graph TD
    subgraph Authoring["1. Resume Authoring"]
        TeX["Overleaf / LaTeX Editor (Parth_Nautiyal_Resume.tex)"]
    end

    subgraph Channels["2. Trigger Channels"]
        ChannelA["Option A: Git Push (git push origin main)"]
        ChannelB["Option B: Dev Console (sync-resume --pin 1721)"]
        ChannelC["Option C: GitHub Action (sync-overleaf.yml)"]
    end

    subgraph Vercel["3. Vercel Build Server"]
        Prebuild["npm run prebuild (scripts/parse-resume-tex.js)"]
        Parser["Deterministic Parser Engine"]
        OutputTS["Generated TypeScript Models (personal, exp, projects, skills, edu)"]
        NgBuild["ng build (Angular 21 Compiler)"]
    end

    subgraph Production["4. Live Production Application"]
        LiveResume["Interactive Resume & Fullscreen PDF"]
        LiveJaeger["Distributed Jaeger Career Timeline"]
        LiveHero["Hero & About Sections"]
        LiveSkills["Categorized Technical Skills Grid"]
        LiveConsole["Interactive CLI Autocomplete"]
    end

    TeX --> ChannelA
    TeX --> ChannelB
    TeX --> ChannelC

    ChannelA --> Prebuild
    ChannelB --> Prebuild
    ChannelC --> Prebuild

    Prebuild --> Parser
    Parser --> OutputTS
    OutputTS --> NgBuild
    NgBuild --> LiveResume
    NgBuild --> LiveJaeger
    NgBuild --> LiveHero
    NgBuild --> LiveSkills
    NgBuild --> LiveConsole
```

</details>

---

## 2. LaTeX Parser Token Extraction Engine

```mermaid
graph LR
    subgraph Input["Raw LaTeX Sections"]
        H["Heading & Contact"]
        S["Summary Block"]
        E["Experience Block"]
        P["Projects Block"]
        K["Technical Skills Block"]
        D["Education Block"]
    end

    subgraph Engine["Parser Engine (parse-resume-tex.js)"]
        Clean["Macro Stripper"]
        Taxonomy["Skill Taxonomy & Icon Matcher"]
        DateParser["Period & Metrics Extractor"]
    end

    subgraph Models["Type-Safe Exports"]
        P_TS["personal.ts"]
        E_TS["experience.ts"]
        R_TS["resume-projects.ts"]
        K_TS["skills.ts"]
        D_TS["education.ts"]
    end

    H & S --> Clean --> P_TS
    E --> Clean & DateParser --> E_TS
    P --> Clean --> R_TS
    K --> Taxonomy --> K_TS
    D --> Clean --> D_TS
```

---

## 3. Cross-Device Zero-Config Security Architecture

```mermaid
sequenceDiagram
    autonumber
    actor User as You (Any Browser or Phone)
    participant Console as Dev Console (Client)
    participant API as /api/sync-resume (Vercel Serverless)
    participant Env as Vercel Encrypted Secrets
    participant Hook as Vercel Build Engine

    User->>Console: sync-resume --pin 1721
    Console->>API: POST /api/sync-resume { pin: "1721" }
    API->>Env: Compare with ADMIN_PIN
    alt PIN Valid
        API->>Env: Read VERCEL_DEPLOY_HOOK_URL
        API->>Hook: POST Deploy Hook (Server-to-Server)
        Hook-->>API: 201 Created (Build Triggered)
        API-->>Console: 200 OK (Build Queued)
        Console-->>User: Success: Vercel compiling live site (~60s)
    else PIN Invalid
        API-->>Console: 401 Unauthorized
        Console-->>User: Error: Incorrect PIN
    end
```
