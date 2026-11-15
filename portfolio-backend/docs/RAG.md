# RAG chatbot (LangChain4j + OpenAI embeddings + Neon pgvector)

The `/api/chat` endpoint enriches every prompt with knowledge-base chunks retrieved by semantic
(cosine-similarity) search. This is additive: the static `RESUME_CONTEXT`, the optional client
`kbContext`, and the Gemini -> OpenAI -> Ollama -> canned-reply provider fallback in
`ChatController` are unchanged.

## Architecture

```
src/main/resources/knowledge-base/profile.md
        |  RagIngestionRunner (background thread at startup)
        v
DocumentSplitters.recursive(500, 50)        -> List<TextSegment>        (LangChain4j)
OpenAiEmbeddingModel text-embedding-3-small -> List<Embedding> (1536-d) (LangChain4j)
PgVectorEmbeddingStore                      -> Neon Postgres table resume_embeddings (pgvector)

POST /api/chat
  RagService.retrieveRelevantContext(message, 4)
    embed query -> EmbeddingStore.search(EmbeddingSearchRequest, minScore 0.6)
  -> top chunks appended to the system context as "RELEVANT KNOWLEDGE BASE CONTEXT"
```

Code: `com.parth.portfolio.rag`
- `RagConfig`: `EmbeddingModel` and `EmbeddingStore<TextSegment>` beans.
- `RagService`: initialization, ingestion, and retrieval.
- `RagIngestionRunner`: startup ingestion.

### Neon SSL
`PgVectorEmbeddingStore.builder()` (host/port/user/password) has no SSL options, and Neon
enforces TLS. We use `PgVectorEmbeddingStore.datasourceBuilder().datasource(...)` instead and
pass our own HikariCP pool wrapping a `PGSimpleDataSource` with `sslMode=require` and
`channelBinding=require`. The store, table creation, and cosine search are still LangChain4j's
stock pgvector implementation. Only the connection wiring is ours.

### Why pgvector only (no Qdrant)
One vector store is enough for a single small knowledge base. Running Qdrant as well would mean
redundant infrastructure doing the same job. pgvector on Neon gives managed, serverless Postgres
with scale-to-zero, and there is nothing extra to operate.

### Why retrieval instead of a longer prompt
An embedding model turns text into a fixed-length vector (1536 floats here) such that semantically
similar text ends up close together in that vector space, regardless of exact wording. Comparing
vectors with cosine similarity (the angle between them, not their length) ranks knowledge-base
chunks by relevance to the question instead of by keyword overlap. Splitting `profile.md` into
~500-character overlapping chunks keeps each embedding focused on one topic — a query about Kafka
experience should retrieve the chunk about that job, not a single vector averaged over the whole
resume. This scales better than growing the static system prompt indefinitely, and it means the
bot's knowledge can be updated by editing a markdown file and re-ingesting, not by retraining or
hand-editing a prompt string.

## Ingestion
- Runs once per startup on a virtual thread (`rag-ingestion`), after the app is already serving.
  Startup is never blocked or failed by a slow Neon cold start, a DB outage, or a bad key.
- Stores a SHA-256 hash of `profile.md` in each segment's metadata (`kb_hash`). On startup it
  probes the store. If the stored hash matches, it skips ingestion. If the content changed, it
  clears the table (`removeAll`) and re-ingests. If the table is empty, it ingests.
- **To update what the bot knows**, edit `knowledge-base/profile.md` and redeploy.

## Degraded mode
If `OPENAI_API_KEY` or any required `RAG_PG_*` variable is missing, or the DB is unreachable at
startup, RAG logs a single `RAG disabled: ...` line. `retrieveRelevantContext` then returns an
empty list and chat behaves exactly as it did before RAG.

The beans are not `@Conditional` on purpose. Spring AOT evaluates conditions at native-image
build time, where these env vars do not exist, so RAG would be compiled out of the prod binary.
Instead the beans return `null` at runtime when unconfigured, and they are `@Lazy`, so they are
resolved inside a try/catch.

## Environment variables

| Var | Required | Default | Notes |
|---|---|---|---|
| `OPENAI_API_KEY` | yes (for RAG) | - | Already used by chat. Also used for embeddings. |
| `RAG_PG_HOST` | yes | - | e.g. `ep-xxx-pooler.<region>.aws.neon.tech` |
| `RAG_PG_PORT` | no | `5432` | |
| `RAG_PG_DATABASE` | yes | - | `portfolio_rag` |
| `RAG_PG_USER` | yes | - | |
| `RAG_PG_PASSWORD` | yes | - | Secret. Never commit it. |
| `RAG_PG_SSLMODE` | no | `require` | |
| `RAG_PG_CHANNEL_BINDING` | no | `require` | Set to `prefer` if SCRAM channel binding causes issues. |

`.env.example` block (placeholders only):

```
# RAG (Neon pgvector) - see docs/RAG.md
OPENAI_API_KEY=sk-your-openai-key
RAG_PG_HOST=ep-your-endpoint-pooler.region.aws.neon.tech
RAG_PG_PORT=5432
RAG_PG_DATABASE=portfolio_rag
RAG_PG_USER=your_neon_user
RAG_PG_PASSWORD=your_neon_password
RAG_PG_SSLMODE=require
RAG_PG_CHANNEL_BINDING=require
```

### TODO (production, Render)
Render dashboard -> backend service -> Environment. Set `RAG_PG_HOST`, `RAG_PG_DATABASE`,
`RAG_PG_USER`, `RAG_PG_PASSWORD` (from the Neon project `portfolio-rag`), and make sure
`OPENAI_API_KEY` is set. These are runtime env vars, so `deploy.yml` needs no changes. After
deploying, check the logs for `RAG ingested N segments` or `RAG knowledge base up to date`.

## Native image
The OpenAI module ships its own `reflect-config.json`. pgjdbc and HikariCP are covered by the
GraalVM reachability metadata. `NativeHints` additionally registers:
- the `knowledge-base/**` and `opennlp/**` resources (the OpenNLP sentence model, used by the
  recursive splitter);
- `com.pgvector.PGvector` for reflection.

Native compatibility is unverified locally because there is no GraalVM toolchain on the dev
machine. Run `gh workflow run deploy.yml` and check that the image builds and that
`RAG ingested ...` shows up in the Render logs.

