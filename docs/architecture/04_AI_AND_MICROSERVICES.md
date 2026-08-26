# Architecture: Multi-LLM RAG & Microservices Backend

This document details the backend microservices architecture, asynchronous event pipelines, and the multi-LLM retrieval-augmented generation (RAG) orchestration engine.

---

## 1. Multi-LLM RAG & Microservices Overview

![Multi-LLM RAG and Microservices](assets/04_ai_and_microservices.svg)

<details>
<summary><b>View Mermaid Source Code</b></summary>

```mermaid
sequenceDiagram
    autonumber
    actor User as Recruiter or Visitor
    participant Frontend as Angular Chat Component
    participant Backend as Spring Boot 3.4.x Backend
    participant Knowledge as Resume Knowledge Store
    participant AI as Multi-LLM Providers (Claude, Gemini, OpenAI, Ollama)

    User->>Frontend: Submit question (e.g. Kafka scaling benchmarks)
    Frontend->>Backend: POST /api/chat
    Backend->>Knowledge: Query context chunks & metrics
    Knowledge-->>Backend: Return ground-truth context
    Backend->>Backend: Assemble context-injected prompt
    Backend->>AI: Generate completion
    AI-->>Backend: Streamed token response
    Backend-->>Frontend: 200 OK { reply }
    Frontend-->>User: Render formatted markdown response
```

</details>

---

## 2. Distributed Microservices & Event Architecture

```mermaid
graph TD
    subgraph Ingestion["1. Ingestion & Security Layer"]
        Gateway["API Gateway (Spring Cloud)"]
        AuthFilter["Spring Security Filter Chain"]
    end

    subgraph EventStream["2. Distributed Event Streaming (Apache Kafka)"]
        TopicIngest["Kafka Topic: system.events.ingest"]
        TopicProcess["Kafka Topic: system.events.processed"]
        DLQ["Kafka Topic: system.events.dlq"]
    end

    subgraph Orchestration["3. Workflow Orchestration (Temporal.io)"]
        Workflow["Temporal Workflow Engine (Idempotency & State)"]
        Activity1["Activity 1: Validate Payload"]
        Activity2["Activity 2: Async Processing"]
        Activity3["Activity 3: Database Commit"]
    end

    subgraph Storage["4. Polyglot Persistence Layer"]
        Postgres[("PostgreSQL Database")]
        Redis[("Redis Cache")]
    end

    subgraph Observability["5. Telemetry & Monitoring"]
        Prometheus["Prometheus Metrics"]
        Grafana["Grafana Dashboards"]
        Datadog["Datadog APM Traces"]
    end

    Gateway --> AuthFilter
    AuthFilter --> TopicIngest
    TopicIngest --> Workflow
    Workflow --> Activity1
    Activity1 --> Activity2
    Activity2 --> Activity3
    Activity3 --> TopicProcess
    Activity2 -.-> DLQ

    Activity3 --> Postgres
    Activity1 --> Redis

    Workflow --> Prometheus
    Activity2 --> Datadog
    Prometheus --> Grafana
```
