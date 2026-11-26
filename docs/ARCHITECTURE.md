# ParcelTrack — Architecture & Data Model

## Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    User {
        string id PK
        string name
        string email UK
        string passwordHash
        enum role "ADMIN | AGENT"
        string phone
        string vehicleInfo
        string zone
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }

    Checkpoint {
        string id PK
        string name
        string code UK
        enum type "PICKUP_HUB | SORTING_CENTRE | DISPATCH_BRANCH"
        string address
        string city
        float lat
        float lng
        datetime createdAt
    }

    Parcel {
        string id PK
        string trackingNumber UK
        string senderName
        string senderPhone
        string pickupAddress
        float pickupLat
        float pickupLng
        string recipientName
        string recipientPhone
        string destinationAddress
        float destinationLat
        float destinationLng
        float weightKg
        enum deliveryType "STANDARD | EXPRESS | SAME_DAY"
        enum status "ParcelStatus (incl. RETURNED)"
        string deliveryPin
        datetime estimatedDeliveryAt
        json routeGeometry "GeoJSON LineString"
        string currentCheckpointId FK
        string createdById FK
        datetime createdAt
        datetime updatedAt
    }

    TrackingEvent {
        string id PK
        string parcelId FK
        string checkpointId FK
        enum status "ParcelStatus"
        string locationName
        float lat
        float lng
        string notes
        string createdById FK
        datetime createdAt
    }

    Delivery {
        string id PK
        string parcelId UK,FK
        string agentId FK
        string assignedById FK
        enum status "ASSIGNED | IN_PROGRESS | COMPLETED | FAILED"
        int attemptCount
        int pinAttempts
        string failureReason
        datetime assignedAt
        datetime updatedAt
    }

    ProofOfDelivery {
        string id PK
        string deliveryId UK,FK
        string parcelId UK,FK
        string recipientName
        boolean pinVerified
        enum outcome "DELIVERED | FAILED"
        string notes
        datetime deliveredAt
    }

    User ||--o{ Parcel : "creates (createdBy)"
    User ||--o{ Delivery : "assigned to (agent)"
    User ||--o{ Delivery : "assigns (assignedBy)"
    User |o--o{ TrackingEvent : "records"
    Checkpoint |o--o{ Parcel : "currentCheckpoint"
    Checkpoint |o--o{ TrackingEvent : "located at"
    Parcel ||--o{ TrackingEvent : "has history"
    Parcel ||--o| Delivery : "assigned via"
    Parcel ||--o| ProofOfDelivery : "confirmed by"
    Delivery ||--o| ProofOfDelivery : "produces"
```

## Entity Responsibilities

- **`User`**: Separates authenticated `ADMIN` staff from `AGENT` couriers under one identity model so RBAC middleware can enforce permissions cleanly without duplicate auth tables.
- **`Checkpoint`**: Models physical sorting centres, pickup hubs, and dispatch branches as reusable geographic anchors rather than duplicating hub coordinates across parcels and events.
- **`Parcel`**: Acts as the central shipment aggregate holding sender/recipient metadata, current status, precomputed route geometry, and the server-generated delivery PIN.
- **`TrackingEvent`**: Provides an immutable, append-only audit trail of every status transition and checkpoint scan for customer timelines and operational accountability.
- **`Delivery`**: Decouples courier assignment, attempt counters, and PIN retry state from the parcel itself so reassignments or failed attempts never overwrite core shipment metadata.
- **`ProofOfDelivery`**: Captures an auditable completion record (`recipientName`, `pinVerified`, `deliveredAt`) only after valid PIN confirmation.

## Design Decisions

- **`TrackingEvent` as Single Source of Truth for Status:** `PATCH /api/parcels/:id` is strictly metadata-only. Every status change must flow through `POST /api/parcels/:id/events` or the `/api/deliveries/*` endpoints inside a `prisma.$transaction`, guaranteeing `Parcel.status` and `TrackingEvent` history never drift out of sync.
- **`routeGeometry` Stored as Raw GeoJSON `LineString`:** Storing a single `LineString` JSON object directly on `Parcel` avoids `FeatureCollection` wrapper boilerplate and lets MapLibre GL JS bind directly to the route source with minimal transformation.
- **`pinAttempts` Tracked on `Delivery` (Not `Parcel`):** Retry throttling belongs to the active courier delivery attempt rather than the shipment's permanent identity; if an admin reassigns a parcel, retry state resets cleanly with the assignment.
- **Seed One Parcel in Every Status:** Seeding all seven `ParcelStatus` values (`PENDING`, `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED_ATTEMPT`, `RETURNED`) ensures every status filter, badge color, and map state is testable from Day 1.
