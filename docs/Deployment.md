# 🚀 Production Deployment & DevOps Specifications

This document outlines the container deployment setups, continuous integration (CI) workflows, system scalability guidelines, and environment configurations for **DeliveryTracker**.

---

## 🐳 Docker Container Orchestration

DeliveryTracker packages its application inside highly-optimized multi-stage Docker images to reduce image sizes and minimize exposure to dependency vulnerabilities.

### 1. Build Phase (`Dockerfile`)
- Uses `eclipse-temurin:21-jdk-alpine` to compile and package the binary.
- Caches Maven local dependencies to speed up subsequent image builds.
- Packages only the final compiled `.jar` file into the runtime image stage, discarding all source files and compiler layers.

### 2. Runtime Phase (`Dockerfile`)
- Uses the lightweight `eclipse-temurin:21-jre-alpine` image.
- Runs the application process under an isolated non-root user `appuser` (UID/GID 1000).
- Applies JVM memory percentage limit configurations (`-XX:MaxRAMPercentage=75.0`).

### 3. Docker Compose Orchestration
The multi-container stack runs with **PostgreSQL 16** and the **Spring Boot API** linked through an isolated bridge network `deliverytracker-network`.

#### Start Services Command:
```bash
docker compose up -d --build
```
*Note: The application container includes a health check checkup that waits (via `depends_on: db: condition: service_healthy`) for PostgreSQL to accept socket connections before bootstrapping the JVM.*

---

## ⛓️ Continuous Integration Pipeline (GitHub Actions)

Every pull-request and branch merge triggers the automated Maven integration pipeline defined in `.github/workflows/ci.yml`.

### Pipeline Stages:
1. **Checkout Code**: Extracts repository files to the runner environment.
2. **Java 21 Setup**: Installs OpenJDK 21 via Eclipse Temurin distribution.
3. **Maven Caching**: Caches `~/.m2/repository` based on the hash of the `pom.xml`.
4. **Compile & Run Test Suite**: Runs the full test suite (`mvn clean package -B`). If any unit, MockMVC, or Testcontainers integration test fails, the pipeline immediately aborts and prevents branch merging.
5. **Archive Artifacts**: Uploads compiled build binaries (`deliverytracker-0.0.1-SNAPSHOT.jar`) as accessible pipeline artifacts.

---

## 📈 Scalability Roadmap

For high-volume production operations (comparable to Delhivery's live transaction volumes), the following service integrations should be introduced:

### 1. Read Path Cache Layer (Redis)
- Store hot pricing cards (`RateCard`) and customer profile contexts inside Redis memory keys to avoid redundant SQL database round-trips.

### 2. Message Bus Architecture (Kafka)
- Decouple write operations by introducing event messaging. When a shipment is created, emit a `ShipmentCreated` event to a Kafka broker. Consumers like Notifications and Assignments can process the messages asynchronously without blocking web threads.

### 3. Search Engine Indexing (Elasticsearch)
- Offload paginated tracking history queries, sorting parameters, and customer lists from primary PostgreSQL tables into Elasticsearch indices for fast searching.
