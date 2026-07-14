# =============================================================================
# Stage 1: BUILD
# Uses the full Maven + JDK 21 image to compile and package the fat JAR.
# The Maven local repository is cached in a named volume so repeated builds
# only download changed dependencies.
# =============================================================================
FROM eclipse-temurin:21-jdk-alpine AS build

# Install Maven (Alpine package — keeps the image lean)
RUN apk add --no-cache maven

WORKDIR /workspace

# ── Dependency resolution (cached layer) ─────────────────────────────────────
# Copy only the POM first. If pom.xml hasn't changed, Docker reuses this layer
# and skips the slow `mvn dependency:go-offline` step on subsequent builds.
COPY pom.xml .
RUN mvn dependency:go-offline -B

# ── Source copy + package ──────────────────────────────────────────────────────
COPY src ./src
RUN mvn package -B -DskipTests

# =============================================================================
# Stage 2: RUNTIME
# Copies ONLY the fat JAR into a slim JRE image. No Maven, no source code,
# no build artefacts end up in the final image.
# =============================================================================
FROM eclipse-temurin:21-jre-alpine AS runtime

# Create a non-root user to run the application (security best practice)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy the fat JAR produced in the build stage
COPY --from=build /workspace/target/deliverytracker-0.0.1-SNAPSHOT.jar app.jar

# Transfer ownership to the non-root user
RUN chown appuser:appgroup app.jar

USER appuser

# Expose the application port
EXPOSE 8080

# ── JVM tuning flags ───────────────────────────────────────────────────────────
# -XX:+UseContainerSupport  — honours Docker CPU/memory limits
# -XX:MaxRAMPercentage=75.0 — use up to 75 % of container RAM for heap
# -Djava.security.egd      — faster startup by using /dev/urandom
ENV JAVA_OPTS="-XX:+UseContainerSupport \
               -XX:MaxRAMPercentage=75.0 \
               -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
