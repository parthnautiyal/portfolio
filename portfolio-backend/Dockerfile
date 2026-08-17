# Backend-only native image — Angular served separately via Vercel.
# Build context must be portfolio-backend/ directory.

# ── Stage 1: GraalVM native image ─────────────────────────────────────────────
FROM ghcr.io/graalvm/native-image-community:21 AS native-build
WORKDIR /app

# Dependency cache layer
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q -P!frontend

COPY src ./src

# No Angular files — Vercel handles the frontend
RUN ./mvnw -P!frontend -Pnative package -DskipTests -q

# ── Stage 2: Minimal runtime (~80 MB) ─────────────────────────────────────────
FROM debian:bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN groupadd -r app && useradd -r -g app app
WORKDIR /app
COPY --from=native-build /app/target/portfolio-backend ./portfolio-backend
RUN chmod +x ./portfolio-backend
USER app
EXPOSE 10000
ENTRYPOINT ["./portfolio-backend"]
