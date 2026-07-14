# 📦 DeliveryTracker — Express Logistics & Operations Platform

An enterprise-grade, monorepo-structured **Last-Mile Delivery Tracker** platform. It features an automated volumetric pricing engine, intelligent geodist-based agent auto-assignment, an immutable tracking ledger, multi-channel notification flows, and role-based stateless security.

Developed following SOLID design principles, clean architecture separation, and an organized feature-driven modular backend package layout.

---

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture Overview](#-architecture-overview)
- [Folder Structure](#-folder-structure)
- [Authentication](#-authentication)
- [Pricing Engine](#-pricing-engine)
- [Zone Detection](#-zone-detection)
- [Auto Assignment](#-auto-assignment)
- [Tracking](#-tracking)
- [Failed Delivery](#-failed-delivery)
- [Notifications](#-notifications)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running Locally](#-running-locally)
- [Docker](#-docker)
- [Deployment](#-deployment)
- [Swagger](#-swagger)
- [API Overview](#-api-overview)
- [Testing](#-testing)
- [Future Enhancements](#-future-enhancements)
- [Authors](#-authors)

---

## 🌟 Project Overview
DeliveryTracker is designed to manage the full end-to-end operational lifecycle of last-mile package delivery. Customers can register, book shipments with real-time charge estimations, and monitor a live tracking timeline. Administrators manage master configurations (zones, areas, rate cards, and surcharges), assign agents manually, or trigger automated assignment pipelines. Agents receive orders and update delivery milestones, triggering real-time customer alert dispatches.

---

## 🚀 Features
- **Dynamic Pricing Engine**: Automated billing calculations matching dimensions, weights, and zone rules.
- **Intelligent Courier Matching**: Instantaneous agent assignments based on availability and proximity.
- **Full Tracking Timeline**: An append-only chronological log of shipment statuses and actor comments.
- **Robust Exception Handling**: Connection timeouts and fallback strategies for external services.
- **Stateless Role Security**: Strict path access rules for Customers, Agents, and Admins.
- **Configurable Administration**: Complete CRUD dashboards to alter rate cards, add areas, and monitor system metrics.

---

## 🛠️ Technology Stack
- **Backend Core**: Spring Boot 3.4.1 (Java 21)
- **Frontend App**: React 18, Vite, React Router, TailwindCSS (glassmorphic styling)
- **Database / Schema**: PostgreSQL 16, Flyway migrations
- **Object Mapper**: MapStruct 1.6.3 (Lombok integration)
- **API Spec**: Springdoc OpenAPI / Swagger UI
- **Notifications**: JavaMailSender (Mailtrap), console-logged SMS
- **Testing**: JUnit 5, Mockito, Testcontainers

---

## 🏛️ Architecture Overview
The platform follows a layered clean architecture design pattern:
- **Presentation Layer**: React frontend UI / Spring REST Controllers.
- **Service Layer**: Business transaction boundaries and domain services.
- **Domain Layer**: JPA Database entities and domain repositories.
- **Infrastructure Layer**: Spring Security filters, JWT decoders, and mail sender clients.

---

## 🗂️ Folder Structure
```
deliverytracker/                 # Root Directory (Monorepo)
├── deliverytracker/             # Spring Boot Backend Service
│   ├── src/
│   │   ├── main/java/com/lastmile/deliverytracker/
│   │   │   ├── admin/           # Admin CRUD dashboards & aggregations
│   │   │   ├── auth/            # Registration, login, and profile services
│   │   │   ├── common/          # Common base entity definitions
│   │   │   ├── config/          # CORS, Async, and security configurations
│   │   │   ├── notification/    # Event-driven email & SMS handlers
│   │   │   ├── pricing/         # Pricing rules and volumetric calculators
│   │   │   ├── security/        # JWT validators and filters
│   │   │   └── tracking/        # History logs & state transitions
│   │   └── main/resources/
│   │       ├── db/migration/    # Flyway schema migration files
│   │       └── application.yml  # Application settings
│   ├── pom.xml                  # Maven Configuration
│   └── Dockerfile               # Backend compilation dockerfile
├── frontend/                    # Vite + React Frontend Application
│   ├── src/                     # React dashboard screens
│   ├── package.json             # NPM dependencies
│   └── vercel.json              # Vercel SPA routing redirects
├── docker-compose.yml           # Local container orchestration file
├── README.md                    # Main Project README documentation
└── system_design_writeup.md      # Project system design review
```

---

## 🔐 Authentication
Authentication is stateless and managed via JWT (JSON Web Tokens). Upon logging in:
- A token is signed with a configurable HMAC-SHA256 secret key.
- The React client stores the token and appends it to subsequent request headers: `Authorization: Bearer <token>`.
- **Role-Based Access Control**:
  *   `/api/v1/auth/**` is public.
  *   `/api/v1/admin/**` requires `ROLE_ADMIN`.
  *   `/api/v1/agents/**` requires `ROLE_AGENT`.
  *   `/api/v1/shipments/**` is restricted based on client role mapping.

---

## 💰 Pricing Engine
The platform calculates costs dynamically on booking:
1. **Weight Assessment**: Compares Actual Weight vs Volumetric Weight ($Length \times Width \times Height \div 5000$). The higher value is selected as the *Billable Weight*.
2. **Rate Card Lookup**: Matches the pickup and drop zones to find the active B2B/B2C `rate_cards` record.
3. **Calculation Formula**:
   $$\text{Total Cost} = \text{Base Charge} + (\text{Excess Weight} \times \text{Per Kg Rate}) + \text{Fuel Surcharge} + \text{COD Surcharge (if COD)} + \text{GST (18\%)}$$

---

## 🗺️ Zone Detection
Zones and mapped pincode areas are fully configured in the database. When a shipment is booked:
- System queries the `areas` table by pickup and drop pincodes.
- It determines the mapped pickup `zone_id` and drop `zone_id`.
- The pricing engine checks if these match (Intra-zone rate) or are different (Inter-zone rate) and retrieves the corresponding rate card.

---

## 🤖 Auto Assignment
Shipment assignment matches shipments to agents:
- The admin triggers the auto-assignment sequence for a shipment.
- The matching service queries available agents flagged as `availability_status = 'AVAILABLE'` in the database.
- It calculates the proximity using Euclidean distance from the pickup area coordinates:
  $$d = \sqrt{(y_2 - y_1)^2 + (x_2 - x_1)^2}$$
- The nearest agent is selected, their availability status is set to `BUSY`, and the assignment is saved.

---

## 📍 Tracking
Every shipment state update is written to the append-only `tracking_histories` table, establishing an immutable audit trail:
- Status logs capture transitions: `CREATED` $\rightarrow$ `PICKED_UP` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED`/`FAILED`.
- Logs record the exact timestamp, actor (Customer, Agent, or Admin), current location, and a customized remarks comment.

---

## 🔄 Failed Delivery
If an agent marks a shipment status as `FAILED`:
1. The assigned agent is released (their status returns to `AVAILABLE`).
2. The shipment's active agent assignment is terminated.
3. The customer is notified and can select a new date/time for delivery.
4. Saving the rescheduled date changes the status to `CREATED` and immediately auto-assigns the shipment to the nearest available agent to prepare for the new attempt.

---

## ✉️ Notifications
Decoupled Spring Application Events dispatch notifications to users:
- **Background Async execution**: Event processing runs asynchronously on worker thread pools so SMTP delays do not block users.
- **SMTP Emails**: Sends formatted emails to customers via JavaMailSender (integrated with Mailtrap sandbox).
- **Console SMS**: Logs notifications to the terminal as standard out logs.

---

## 📥 Installation
1. Clone the monorepo to your machine.
2. Install **JDK 21** and **Maven 3.8+**.
3. Install **Node.js** (v18+) for the frontend web app.

---

## ⚙️ Environment Variables
Create a `.env` file at the root or set these environment variables in your run configuration:

```env
# Database Settings
DT_DB_HOST=localhost
DT_DB_PORT=5435
DT_DB_NAME=delivery_tracker
DT_DB_USERNAME=deliverytracker
DT_DB_PASSWORD=deliverytracker_pass

# Security Config
JWT_SECRET_KEY=jdhaskihkasajnc,jsdncvkusfliajdlkamaidhaidkjncjkasndkmdioiwejdijwdfikanankalkadk
JWT_EXPIRATION=86400000

# Mail Settings
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password

# Port configuration
SERVER_PORT=8080
```

---

## 💻 Running Locally

### Backend Startup:
```bash
cd deliverytracker
./mvnw spring-boot:run
```
The server starts listening on port `8080`.

### Frontend Startup:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Docker
A pre-configured `docker-compose.yml` launches the complete multi-container stack:
```bash
docker compose up -d
```
This boots up:
- **`deliverytracker-db`**: PostgreSQL instance on port `5435`.
- **`deliverytracker-app`**: Spring Boot backend application (exposed on port `8080`).

---

## ☁️ Deployment
- **Backend API**: Hosted on **Railway** container service (resolving to internal network database links).
- **Frontend Dashboard**: Hosted on **Vercel** with custom SPA routing rewrites to avoid subroute `404` pages.

---

## 📖 Swagger
The Swagger UI documentation is available on the hosted app at:
`https://deliverytracker-production-507b.up.railway.app/swagger-ui/index.html`

To access it locally, start the backend and go to:
`http://localhost:8080/swagger-ui/index.html`

---

## 🔌 API Overview

### Authentication
*   `POST /api/v1/auth/register` - Create a new user profile
*   `POST /api/v1/auth/login` - Authenticate and retrieve bearer JWT token

### Shipments
*   `POST /api/v1/shipments` - Create a new shipment
*   `GET /api/v1/shipments/my-shipments` - List logged-in customer's shipments
*   `PATCH /api/v1/shipments/{trackingNumber}/reschedule` - Reschedule a failed shipment

### Tracking & Management
*   `GET /api/v1/tracking/{trackingNumber}/timeline` - Get tracking logs
*   `PATCH /api/v1/tracking/{trackingNumber}/status` - Update order milestone status (Agent use)

---

## 🧪 Testing
- **Unit and MockMvc Web Tests**:
  ```bash
  mvn test -Dtest="TrackingServiceImplTest,TrackingControllerTest"
  ```
- **Full Test Suite (requires Docker running for Testcontainers)**:
  ```bash
  mvn test
  ```

---

## 🔮 Future Enhancements
- Integration of Google Maps API for real-time driver coordinates tracking.
- Interactive dashboard analytics charts for courier performance and volume statistics.
- Automated email retries using Spring Batch or Quartz schedulers.

---

## 👥 Authors
- **Pushkar Kadam**
