# 🗺️ DeliveryTracker System Architecture

This document provides a comprehensive view of the architectural design, structural layers, feature-based package layouts, and core design principles utilized in **DeliveryTracker**.

---

## 🏗️ Architectural Pattern: Clean Architecture

DeliveryTracker is designed following **Clean Architecture** and **SOLID** principles. The system enforces strict boundaries between different logical layers of the application to ensure independence of frameworks, testability of business rules, and flexibility of databases or UI layers.

### The Layered Flow of Control

```
  [ Clients / HTTP Request ]
              │
              ▼
    ┌──────────────────┐
    │  Presentation    │ ◄─── Controllers, Validation Filters, JWT Security
    └─────────┬────────┘
              │ (DTOs)
              ▼
    ┌──────────────────┐
    │   Application    │ ◄─── Service Interfaces, Business Rules, Mappers
    └─────────┬────────┘
              │ (Domain Entities)
              ▼
    ┌──────────────────┐
    │    Enterprise    │ ◄─── JPA Entities, Schema Mappings
    └─────────┬────────┘
              │ (SQL / JDBC)
              ▼
      [( PostgreSQL )]
```

### 1. Presentation Layer (`com.lastmile.deliverytracker.common.security`, `*.controller`)
- **Responsibilities**: Access control, path routing, input validation (via Jakarta Validation constraints), deserialization/serialization of requests and responses.
- **Framework dependencies**: Spring Web, Spring Security, Jakarta Servlet API.

### 2. Application Layer (`*.service`, `*.mapper`)
- **Responsibilities**: Orchestrating application use cases, managing database transactions (`@Transactional`), implementing domain calculations (e.g. rate-card weight calculations), mapping entities to DTOs.
- **Framework dependencies**: Pure Java, MapStruct (annotations code-generator). This layer remains independent of the database engine and transport protocol.

### 3. Enterprise/Domain Layer (`*.entity`, `*.repository`)
- **Responsibilities**: Represents core business state models (Entities) and persistence contracts (Repository Interfaces).
- **Framework dependencies**: Jakarta Persistence (JPA), Spring Data JPA.

---

## 📦 Package Organization: Feature-Based Architecture

Rather than separating classes strictly by technical type (e.g. all services in one package, all controllers in another), DeliveryTracker employs a **Feature-Based Package Structure**. Each package represents a standalone functional slice of the system, promoting high cohesion and minimal coupling.

### Package Directory Layout

```
com.lastmile.deliverytracker
├── auth                        # User authentication & credentials
│   ├── controller              # Registration & Login endpoints
│   ├── dto                     # LoginRequest, RegisterResponse, etc.
│   ├── entity                  # User, CustomerProfile, DeliveryAgent
│   ├── enums                   # Role (ADMIN, CUSTOMER, AGENT)
│   ├── repository              # UserRepository, CustomerProfileRepository
│   └── service                 # JwtService, AuthService, CustomUserDetailsService
│
├── shipment                    # Shipment lifecycle
│   ├── controller              # Shipment creation, cancellation & retrieve
│   ├── dto                     # CreateShipmentRequest, ShipmentResponse
│   ├── entity                  # Shipment
│   ├── enums                   # PaymentType, ShipmentStatus
│   ├── exception               # ShipmentNotFoundException
│   ├── repository              # ShipmentRepository
│   └── service                 # ShipmentServiceImpl
│
├── pricing                     # Pricing & Weight tier engine
│   ├── dto                     # RateCardRequest, RateCardResponse
│   ├── entity                  # RateCard, Area
│   ├── mapper                  # RateCardMapper
│   ├── repository              # RateCardRepository, AreaRepository
│   └── service                 # PricingServiceImpl
│
├── assignment                  # Intelligent courier dispatching
│   ├── entity                  # OrderAssignment
│   ├── repository              # OrderAssignmentRepository
│   └── service                 # AssignmentServiceImpl
│
├── tracking                    # Location tracking audit timeline
│   ├── controller              # Status update & Timeline retrieval
│   ├── dto                     # UpdateTrackingRequest, TrackingTimelineResponse
│   ├── entity                  # TrackingHistory
│   ├── mapper                  # TrackingMapper
│   ├── repository              # TrackingHistoryRepository
│   └── service                 # TrackingServiceImpl
│
├── notification                # Internal inbox system
│   ├── controller              # Inbox retrieval, Mark-as-read
│   ├── dto                     # NotificationResponse
│   ├── entity                  # Notification
│   ├── mapper                  # NotificationMapper
│   ├── repository              # NotificationRepository
│   └── service                 # NotificationServiceImpl
│
├── admin                       # Aggregated views & dashboard projections
│   ├── controller              # Dashboard counts, user lifecycle activation
│   ├── dto                     # DashboardResponse, UserAdminResponse
│   ├── mapper                  # AdminMapper
│   └── service                 # AdminServiceImpl, DashboardServiceImpl
│
└── common                      # Global infrastructure components
    ├── constants               # Centralized string keys
    ├── entity                  # BaseEntity (created_at, updated_at)
    ├── exception               # GlobalExceptionHandler, ErrorResponse
    ├── response                # Generic ApiResponse success envelope
    └── security                # SecurityConfig, JwtAuthenticationFilter
```

---

## ⚡ Key Core Workflows

### 1. Shipment Intake & Dynamic Pricing
```
Customer ──► CreateShipmentRequest ──► ShipmentController 
                                                │
                                                ▼
                                       ShipmentService
                                                │
                                                ├─► Fetch active RateCard
                                                ├─► Calculate billable weight
                                                ├─► Compute pricing charge
                                                │
                                                ▼
                                       Save to Database
```

### 2. Status Auditing & Notification Dispatch
```
Delivery Agent ──► UpdateTrackingRequest ──► TrackingController
                                                      │
                                                      ▼
                                              TrackingService
                                                      │
                                                      ├─► Insert TrackingHistory
                                                      ├─► Update Shipment Status
                                                      │
                                                      ▼
                                            NotificationService
                                                      │
                                                      ▼
                                           Insert Notification
```
