# Architecture: Interactive Features, State & Gamification

This document details the reactive state management, tokenized deep-linking, developer console CLI, and quest gamification subsystems.

---

## 1. Interactive Features & State Diagram

![Interactive Features and State Diagram](assets/03_interactive_features.svg)

<details>
<summary><b>View Mermaid Source Code</b></summary>

```mermaid
graph TD
    subgraph RawData["1. Hydrated Resume Models"]
        Exp["experience.ts"]
        Proj["resume-projects.ts"]
        Summ["personal.summary"]
    end

    subgraph Tokenizer["2. Reactive Tokenizer Engine"]
        LinkMap["Architecture Deep-Link Map (Kafka, Temporal, Spring)"]
        SearchScanner["Real-Time Search Scanner & Match Counter"]
    end

    subgraph StateManagement["3. Angular Zone-Safe State Management"]
        CDR["ChangeDetectorRef markForCheck"]
        ZoneRun["ngZone.run Zone Re-entry"]
        ModalState["Fullscreen Modal State (isPdfFullscreen)"]
    end

    subgraph ViewportRender["4. Rendered Interactive Viewport"]
        Highlights["Highlighted Recruiter Role Keywords"]
        DeepLinks["Interactive RouterLinks with QueryParams"]
        ModalOverlay["Fixed Centered PDF Modal with Event Boundaries"]
    end

    RawData --> Tokenizer
    Tokenizer --> LinkMap
    Tokenizer --> SearchScanner
    LinkMap --> StateManagement
    SearchScanner --> StateManagement
    StateManagement --> CDR
    StateManagement --> ZoneRun
    CDR --> ViewportRender
    ZoneRun --> ViewportRender
```

</details>

---

## 2. Developer Console State Machine

```mermaid
graph TD
    Closed["Console Closed"] -->|Ctrl + ` or Click Icon| Open["Console Open"]
    Open -->|Click Minimize| Minimized["Minimized Pill"]
    Minimized -->|Click Pill| Open
    Open -->|Double-Click Titlebar| Maximized["Maximized (Fullscreen)"]
    Maximized -->|Double-Click Titlebar| Open
    Open -->|Type 'exit' or Click Close| Closed

    subgraph CommandDispatch["Command Execution Dispatcher"]
        Open --> Nav["Navigation (resume, system, projects, chat)"]
        Open --> Content["Content (whoami, about, exp, skills, edu)"]
        Open --> Admin["Admin Sync (sync-resume --pin 1721)"]
        Open --> Fun["System & Fun (matrix, joke, quest, neofetch)"]
    end
```

---

## 3. Quest & Achievement Gamification Engine

```mermaid
graph LR
    subgraph Triggers["Interactive Triggers"]
        T1["View Resume Page"]
        T2["Open Fullscreen PDF"]
        T3["Expand Promotion"]
        T4["Toggle Theme"]
        T5["Open Console"]
        T6["Trigger Admin Sync"]
    end

    subgraph Quest["QuestService Engine"]
        Engine["unlockAchievement"]
        XP["XP & Level Calculator"]
    end

    subgraph Feedback["UI Feedback Layer"]
        Toast["Achievement Toast Notification"]
        Badge["Header Progress Pill & Level Badge"]
    end

    T1 --> Engine
    T2 --> Engine
    T3 --> Engine
    T4 --> Engine
    T5 --> Engine
    T6 --> Engine

    Engine --> XP
    XP --> Toast
    XP --> Badge
```
