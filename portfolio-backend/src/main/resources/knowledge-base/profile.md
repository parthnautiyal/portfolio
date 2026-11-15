# Parth Nautiyal - Knowledge Base

This document is the source of truth for the portfolio chatbot's retrieval-augmented generation (RAG) pipeline.
It is split into chunks, embedded with OpenAI text-embedding-3-small, and stored in a Neon Postgres pgvector table.
Edit this file to change what the chatbot knows; the backend re-ingests automatically when the content changes.

## Current role: SDE II at ZopSmart (March 2026 - Present)

Parth Nautiyal works as a Software Development Engineer II (SDE II) at ZopSmart, a role he has held since March 2026.
In this role he scales more than 20 microservices built on a Kafka event-driven architecture and orchestrated with Temporal workflows.
He leads system reliability and performance initiatives across these services.

## Previous role: SDE I at ZopSmart (July 2024 - March 2026)

From July 2024 to March 2026 Parth was a Software Development Engineer I (SDE I) at ZopSmart.
He built Spring Boot microservices using Kafka for messaging and Spring Security for authentication and authorization.
He deployed and operated these services on Kubernetes with Helm charts, and monitored them with Grafana and Datadog.
His work reduced API latency by roughly 50 percent and cut deployment rollbacks by 70 percent.

## Internship: SDE Intern at ZopSmart (January 2024 - July 2024)

Parth started at ZopSmart as a Software Development Engineer Intern from January 2024 to July 2024.
During the internship he practiced test-driven development (TDD) with JUnit and Mockito.
He increased unit test coverage by 45 percent.

## Technical skills

Backend: Java, Spring Boot, microservices architecture, Kafka event streaming, Temporal workflow orchestration, and SQL databases.
Frontend: TypeScript and React.
DevOps and infrastructure: Docker, Kubernetes, Rancher, Helm, Jenkins, and Ansible.
Observability: Grafana, Prometheus, and Datadog.
AI and LLM: LangChain4j, retrieval-augmented generation (RAG), pgvector vector search, and OpenAI, Gemini, and Ollama model integrations.

## Education

Parth holds a Bachelor of Technology (B.Tech) degree in Computer Science from Lovely Professional University.

## Interests and hobbies

Outside of work Parth is interested in system design and contributing to open source.
He keeps his notes in Obsidian and enjoys building custom command-line (CLI) tools.

## Project: AI Portfolio and Multi-LLM RAG Chatbot

This portfolio website is itself one of Parth's projects. It has a Spring Boot 3.5 backend on Java 21, compiled to a GraalVM native image, with an Angular frontend.
The site includes a conversational assistant that answers questions about Parth's career.
The assistant supports multiple LLM providers: Google Gemini, OpenAI, and a local Ollama model, with graceful fallback between them.
It uses retrieval-augmented generation: this knowledge base is chunked and embedded with LangChain4j and OpenAI embeddings, stored in Neon Postgres with pgvector, and the most relevant chunks are retrieved by cosine similarity and injected into the prompt for each question.

## Project: Training and Upskilling v2

Training and Upskilling v2 is a full-stack e-learning platform built by Parth.
It supports structured course publishing, real-time progress tracking for learners, and dashboards.
The tech stack is TypeScript, Angular, and MySQL.

## Project: Automated Deployment Pipeline

The Automated Deployment Pipeline is a CI/CD project that automates deployments on AWS EC2.
It uses Jenkins for continuous integration, Ansible for configuration management, Docker for containerization, and Kubernetes for orchestration.
