# 📦 DeliveryTracker

[![Java CI with Maven](https://github.com/lastmile/deliverytracker/actions/workflows/ci.yml/badge.svg)](https://github.com/lastmile/deliverytracker/actions/workflows/ci.yml)
[![Java Version](https://img.shields.io/badge/Java-21-orange.svg?style=flat&logo=openjdk)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-brightgreen.svg?style=flat&logo=springboot)](https://spring.io/projects/spring-boot)
[![Docker](https://img.shields.io/badge/Docker-Supported-blue.svg?style=flat&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An enterprise-grade **Last Mile Delivery Platform** inspired by Delhivery, built with Spring Boot 3, Java 21, and PostgreSQL. Designed following SOLID principles, Clean Architecture, and a modular Feature-Based package structure.

---

## 📖 Table of Contents

1. [Project Overview](#-project-overview)
2. [Tech Stack](#-tech-stack)
3. [Key Modules](#-key-modules)
4. [Documentation Index](#-documentation-index)
5. [Setup & Quick Start](#-setup--quick-start)
6. [Running with Docker](#-running-with-docker)
7. [Testing](#-testing)
8. [License](#-license)

---

## 🌟 Project Overview

DeliveryTracker manages the full end-to-end lifecycle of a last-mile delivery system:
- **Shipment Lifecycle**: From customer creation through dynamic pricing calculations, dispatch, tracking, and final delivery status.
- **Dynamic Pricing Engine**: Automated delivery charge calculation using zone-based rate cards (e.g. weight tiers and base charges).
- **Intelligent Courier Assignment**: Real-time agent matching and load balance allocation.
- **Real-Time Audited Tracking**: Chronological tracking histories capturing status changes, geographic locations, and remarks.
- **In-App Notifications**: Transactional notification alerts for customers and agents on status transitions.

---

## 🛠️ Tech Stack

- **Core Backend Framework**: Spring Boot 3.4.1 (Java 21)
- **Security**: Spring Security, stateless JWT Bearer authorization
- **Database / Storage**: PostgreSQL 16 (development & production), Flyway for automated schema migrations
- **ORM**: Spring Data JPA & Hibernate
- **Object Mapping**: MapStruct 1.6.3 (fully integrated with Lombok annotation processors)
- **API Documentation**: Springdoc OpenAPI / Swagger UI
- **Testing**: JUnit 5, Mockito, Spring Boot Test, Testcontainers (PostgreSQL integration)
- **Deployment & CI**: Docker, Docker Compose, GitHub Actions

---

## 📦 Key Modules

- **`auth`**: Handles registration, login, and profile tracking for Customers, Agents, and Administrators.
- **`shipment`**: Manages cargo dimensions, origin/destination pins, billable weights, states, and cancellation flows.
- **`pricing`**: Computes pricing zones and applies rate cards based on weight tiers.
- **`assignment`**: Matches delivery shipments to active delivery agents in the designated pickup pincodes.
- **`tracking`**: Maintains an immutable timeline audit of shipment movements.
- **`notification`**: Provides inbox messaging and unread notification tracking.
- **`admin`**: Offers an analytics dashboard and CRUD utilities for master system tables.

---

## 🗂️ Documentation Index

For details on architecture, data models, APIs, and deployments, refer to the documents located in the `docs` directory:

| Document | Description |
|---|---|
| 📑 **[Architecture.md](file:///c:/Users/pushk/OneDrive/Desktop/SpringBoot/deliverytracker/deliverytracker/docs/Architecture.md)** | System design details, clean architecture layers, and package structure. |
| 🗄️ **[Database.md](file:///c:/Users/pushk/OneDrive/Desktop/SpringBoot/deliverytracker/deliverytracker/docs/Database.md)** | Database schemas, Flyway migrations, indexing strategy, and ER diagram. |
| 🔌 **[API.md](file:///c:/Users/pushk/OneDrive/Desktop/SpringBoot/deliverytracker/deliverytracker/docs/API.md)** | Complete endpoint schemas, request/response payloads, and Swagger instructions. |
| 🚀 **[Deployment.md](file:///c:/Users/pushk/OneDrive/Desktop/SpringBoot/deliverytracker/deliverytracker/docs/Deployment.md)** | GitHub Actions CI/CD configs, production Docker optimization, and future enhancements. |

---

## ⚙️ Setup & Quick Start

### Prerequisites
- **JDK 21** installed.
- **Maven 3.8+** installed.
- A running **PostgreSQL** instance (running on port `5433` by default, or overridden in your configuration).

### Step 1: Clone and Configure
1. Clone this repository.
2. Copy the `.env.example` file to create a local environment file:
   ```bash
   cp .env.example .env
   ```
3. Update the database credentials and JWT security secrets in the newly created `.env` file.

### Step 2: Build the Application
```bash
mvn clean compile
```

### Step 3: Run the Application
```bash
mvn spring-boot:run
```
The server will boot up on port `8080` (or the `SERVER_PORT` defined in `.env`).

---

## 🐳 Running with Docker

This project includes multi-stage Docker support and a pre-configured Docker Compose file containing health checks and persistent volumes.

### 1. Launch Services
Ensure your local Docker daemon is running, then start the containers:
```bash
docker compose up -d
```
This launches:
- **`deliverytracker-db`**: PostgreSQL 16 on container port 5432, exposed on host port `5433`.
- **`deliverytracker-app`**: The Spring Boot API (waits until the database container is fully healthy).

### 2. Monitor Container Status
```bash
docker compose ps
```

### 3. Stop Services
```bash
docker compose down
```

---

## 🧪 Testing

The codebase includes a fully-configured unit and integration testing suite utilizing **JUnit 5**, **Mockito**, and **Testcontainers**.

### Run Unit and MockMVC Web Tests
```bash
mvn test -Dtest="TrackingServiceImplTest,TrackingControllerTest"
```

### Run Full Test Suite (requires Docker running for Testcontainers)
```bash
mvn test
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](https://opensource.org/licenses/MIT) for more information.
