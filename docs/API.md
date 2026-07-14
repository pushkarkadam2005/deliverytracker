# 🔌 REST API Documentation & Swagger Guide

This document lists all active REST endpoint routes, query parameters, authentication scopes, request bodies, and standardized response formats.

---

## 🔑 Authentication Scheme

All secured endpoints expect a JWT Bearer token inside the `Authorization` header.

### Authenticating Requests:
1. Call the registration or login endpoints (which are completely public).
2. Grab the token string from the JSON response:
   ```json
   {
     "token": "ey...",
     "email": "customer@example.com"
   }
   ```
3. Attach this token to subsequent requests:
   ```http
   Authorization: Bearer <your_token>
   ```

---

## 🛠️ Endpoint Catalog

### 1. Authentication Endpoints (`/api/v1/auth`)

#### `POST /api/v1/auth/register` (Public)
- **Role**: Guest/Public
- **Description**: Registers a new customer or delivery agent account.
- **Request Body**:
  ```json
  {
    "fullName": "Alice Johnson",
    "email": "alice@example.com",
    "password": "Password123",
    "role": "CUSTOMER",
    "phone": "9876543210",
    "defaultAddress": "123 Main Road, Delhi"
  }
  ```

#### `POST /api/v1/auth/login` (Public)
- **Role**: Guest/Public
- **Description**: Authenticates email/password credentials, returns JWT.
- **Request Body**:
  ```json
  {
    "email": "alice@example.com",
    "password": "Password123"
  }
  ```

---

### 2. Shipment Management Endpoints (`/api/v1/shipments`)

#### `POST /api/v1/shipments` (Secured)
- **Role**: `CUSTOMER`
- **Description**: Creates a new shipment order. Runs validation controls.
- **Request Body**:
  ```json
  {
    "pickupAddress": "Warehouse Alpha, Delhi",
    "deliveryAddress": "Sector 5, Noida",
    "pickupPincode": "110001",
    "deliveryPincode": "201301",
    "receiverName": "Bob Smith",
    "receiverPhone": "9998887777",
    "actualWeight": 4.5,
    "paymentType": "PREPAID"
  }
  ```

#### `GET /api/v1/shipments/{trackingNumber}` (Secured)
- **Role**: `CUSTOMER`, `AGENT`, `ADMIN`
- **Description**: Fetch full package information. Customers are restricted to their own shipments (service-level security controls).

#### `PATCH /api/v1/shipments/{trackingNumber}/cancel` (Secured)
- **Role**: `CUSTOMER`
- **Description**: Soft cancels a shipment order. Only works if status is `CREATED` or `ASSIGNED`.

---

### 3. Real-Time Tracking Endpoints (`/api/v1/tracking`)

#### `GET /api/v1/tracking/{trackingNumber}` (Secured)
- **Role**: `CUSTOMER`, `AGENT`, `ADMIN`
- **Description**: Retrieves chronological tracking logs list.

#### `POST /api/v1/tracking/{trackingNumber}` (Secured)
- **Role**: `AGENT`, `ADMIN`
- **Description**: Appends a new package milestone event (e.g. `PICKED_UP`, `IN_TRANSIT`).
- **Request Body**:
  ```json
  {
    "shipmentStatus": "IN_TRANSIT",
    "location": "Transit Center Gurgaon",
    "remarks": "Package dispatched to delivery office."
  }
  ```

---

### 4. Notification Inbox Endpoints (`/api/v1/notifications`)

#### `GET /api/v1/notifications` (Secured)
- **Role**: `CUSTOMER`, `AGENT`, `ADMIN`
- **Description**: Paginated inbox query returning personal alerts. Supports `?page=0&size=20&sort=createdAt,desc`.

#### `PATCH /api/v1/notifications/{notificationId}/read` (Secured)
- **Role**: `CUSTOMER`, `AGENT`, `ADMIN`
- **Description**: Marks the target notification as read.

---

### 5. Administrative Controls (`/api/v1/admin`)

*All administrative endpoints require the `ADMIN` role scope.*

#### `GET /api/v1/admin/dashboard`
- **Description**: Summary metrics of total active users, registered shipments, and active agents.

#### `PATCH /api/v1/admin/users/{id}/deactivate`
- **Description**: Deactivates a user's account, preventing future login sessions.

---

## 📖 Global Rest Exception Handler Payloads

When requests fail validations or security checks, the global handler wraps the error dynamically:

```json
{
  "timestamp": "2026-07-13T10:22:45",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed. Please correct the request and try again.",
  "path": "/api/v1/shipments",
  "fieldErrors": [
    {
      "field": "pickupPincode",
      "message": "must not be blank"
    }
  ]
}
```

---

## 🌐 OpenAPI Swagger Access

To explore and fire endpoints directly inside your browser:
- **Swagger URL**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON Spec**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)
