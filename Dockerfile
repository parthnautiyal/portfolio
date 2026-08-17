# ── Stage 1: Build Angular ────────────────────────────────────────────────────
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY portfolio-frontend/package*.json ./
RUN npm ci --prefer-offline
COPY portfolio-frontend/ ./
RUN npx ng build --configuration production

# ── Stage 2: GraalVM native image ─────────────────────────────────────────────
FROM ghcr.io/graalvm/native-image-community:21 AS native-build
WORKDIR /app

# Dependency cache layer — only re-downloads when pom.xml changes
COPY portfolio-backend/mvnw portfolio-backend/pom.xml ./
COPY portfolio-backend/.mvn .mvn
RUN chmod +x mvnw && ./mvnw dependency:go-offline -q -P!frontend

# Spring Boot application source
COPY portfolio-backend/src ./src

# Embed Angular static files — Spring Boot serves these at /
COPY --from=frontend-build /app/dist/portfolio-frontend/browser ./src/main/resources/static

# Embed Angular content TS files — read by JobMatchController via classpath
COPY portfolio-frontend/src/app/content ./src/main/resources/content

# Compile native binary; skip frontend profile (files already embedded above)
RUN ./mvnw -P!frontend -Pnative package -DskipTests -q

# ── Stage 3: Minimal runtime (~80 MB image) ────────────────────────────────────
FROM debian:bookworm-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN groupadd -r app && useradd -r -g app app
WORKDIR /app
COPY --from=native-build /app/target/portfolio-backend ./portfolio-backend
RUN chmod +x ./portfolio-backend
USER app
EXPOSE 8080
ENTRYPOINT ["./portfolio-backend"]
