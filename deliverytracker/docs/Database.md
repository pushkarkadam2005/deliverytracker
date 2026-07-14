# 🗄️ Database Schema & Persistence

This document details the relational structure, table architectures, fields, indices, and Flyway migration procedures for the **DeliveryTracker** database.

---

## 💾 Relational Data Model

The application uses **PostgreSQL 16** as its primary transactional database. The schema is normalized up to the Third Normal Form (3NF) to guarantee transactional integrity and eliminate redundant updates.

### 1. Identity & Profiles Module
- **`users`**: Contains credential records and core login parameters.
  - `email` (VARCHAR 150, UNIQUE, INDEX): Used for quick lookup during JWT authentication.
  - `role` (VARCHAR 20): Roles include `ADMIN`, `CUSTOMER`, and `AGENT`.
  - `is_active` (BOOLEAN): Soft deactivation flag controlled by the administrator.
- **`customer_profiles`**: Associated details for users registered as `CUSTOMER`.
  - `user_id` (BIGINT, FK): One-to-one mapping targeting `users.id`.
- **`delivery_agents`**: Associated details for agents running physical deliveries.
  - `user_id` (BIGINT, FK): One-to-one mapping targeting `users.id`.
  - `current_pincode` (VARCHAR 10): Used by the scheduler to identify agent proximity.

### 2. Logistics & Core Transactions
- **`shipments`**: Represents shipment packages in delivery lifecycle.
  - `tracking_number` (VARCHAR 50, UNIQUE, INDEX): Unique business tracker format.
  - `customer_id` (BIGINT, FK): Identifies ordering entity.
  - `shipment_status` (VARCHAR 50): Valid status options: `CREATED`, `ASSIGNED`, `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`.
  - Weights (`actual_weight`, `volumetric_weight`, `billable_weight`): Used by pricing engine calculation metrics.
- **`order_assignments`**: Assigns specific agents to pick up/deliver shipments.
  - `shipment_id` (BIGINT, FK): Links shipment entity.
  - `agent_id` (BIGINT, FK): Target courier entity.
- **`tracking_histories`**: Immutable audit logs tracing package events.
  - `shipment_id` (BIGINT, FK): Shipment target context.
  - `shipment_status` (VARCHAR 50): Status at timestamp record creation.
  - `location` (VARCHAR 150): Current geographical node.

### 3. Messaging & Pricing Setup
- **`notifications`**: Inbox messages triggered on shipment tracking status transitions.
  - `user_id` (BIGINT, FK): Recipient identity.
  - `is_read` (BOOLEAN): Message state.
- **`rate_cards`**: Master pricing engine parameters.
  - `weight_slab` (NUMERIC): Weight tiers.
  - `base_charge` (NUMERIC): Platform base price.
  - `per_kg_charge` (NUMERIC): Additional weight multiplier.

---

## ⚡ Index Optimization Plan

To handle Delhivery-scale concurrency and search frequencies, the following key indices are created:

1. **`idx_users_email`**: Unique hash/B-Tree index on `users(email)` for high-speed security logins.
2. **`idx_shipments_tracking`**: Unique B-Tree index on `shipments(tracking_number)` for high-frequency location checkups.
3. **`idx_tracking_shipment`**: Compound index on `tracking_histories(shipment_id, updated_at ASC)` to fast-construct chronological user timelines.
4. **`idx_notifications_user_unread`**: Index on `notifications(user_id) WHERE is_read = false` to accelerate notification counts and dashboard alert queries.

---

## 🔄 Flyway Version Migrations

All SQL schema changes must be updated version-by-version using Flyway migration scripts.
- **Path**: `src/main/resources/db/migration`
- **Naming format**: `V{VersionNumber}__Description.sql` (e.g. `V1__init_schema.sql`)

### Database Evolution Policy:
- **No Direct Schema Alterations**: Developers must never modify the database schema directly inside PostgreSQL manually.
- **Hibernate Integration**: `spring.jpa.hibernate.ddl-auto` is set to `validate` in all environments, ensuring Hibernate fails fast if Flyway migrations do not match code entities.
