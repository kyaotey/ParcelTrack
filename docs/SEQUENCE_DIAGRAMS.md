# ParcelTrack — Sequence Diagrams

## 1. Delivery Confirmation (`POST /confirm`) & Failed Attempt (`POST /attempt`)

```mermaid
sequenceDiagram
    autonumber
    actor Agent as Delivery Agent (UI)
    participant API as Express API (/api/deliveries)
    participant DB as PostgreSQL (Prisma)
    participant IO as Socket.IO Server
    actor Listeners as Admin & Public Rooms

    Note over Agent,Listeners: Flow A: Delivery Confirmation with PIN (POST /confirm)
    Agent->>API: POST /api/deliveries/:parcelId/confirm { recipientName, pin, notes }
    API->>API: Verify JWT (AGENT) & Zod body
    API->>DB: Find Delivery + Parcel (verify agentId == req.user.id)

    alt Delivery missing or not assigned to agent
        API-->>Agent: 403 / 404 Error JSON
    else Delivery COMPLETED or pinAttempts >= 3
        API-->>Agent: 429 Locked (Max 3 PIN attempts exceeded)
    else Wrong PIN (no status change, no socket emit)
        API->>DB: Update Delivery: increment pinAttempts (+1)
        API-->>Agent: 400 Invalid PIN { remainingAttempts: 3 - pinAttempts }
    else Valid PIN
        API->>DB: prisma.$transaction: create ProofOfDelivery, update Delivery(COMPLETED), update Parcel(DELIVERED), create TrackingEvent(DELIVERED)
        DB-->>API: Committed { parcel, proofOfDelivery, trackingEvent }
        API->>IO: Emit "parcel:delivered" to "admin" & "parcel:trackingNumber"
        IO-->>Listeners: { parcelId, trackingNumber, proofOfDelivery, deliveredAt }
        API-->>Agent: 200 OK { parcel, proofOfDelivery, trackingEvent }
    end

    Note over Agent,Listeners: Flow B: Failed Delivery Attempt (POST /attempt)
    Agent->>API: POST /api/deliveries/:parcelId/attempt { failureReason, locationName, lat, lng, notes }
    API->>API: Verify JWT (AGENT) & Zod body
    API->>DB: prisma.$transaction: update Delivery(FAILED, attemptCount + 1, failureReason), update Parcel(FAILED_ATTEMPT), create TrackingEvent(FAILED_ATTEMPT)
    DB-->>API: Committed { parcel, delivery, trackingEvent }
    API->>IO: Emit "parcel:updated" to "admin" & "parcel:trackingNumber"
    IO-->>Listeners: { parcelId, trackingNumber, status: "FAILED_ATTEMPT", latestEvent, updatedAt }
    API-->>Agent: 200 OK { parcel, delivery, trackingEvent }
```

**Design Rationale:**
PIN verification in `POST /confirm` is capped at 3 attempts to mirror production OTP rate-limiting and prevent brute-force guessing, rejecting wrong PINs without mutating parcel status or broadcasting false tracking events. A real-world failed delivery (e.g., recipient unavailable) is separated into `POST /attempt`, which atomically updates `Delivery`, `Parcel`, and `TrackingEvent` and notifies both the admin and customer in real time.

---

## 2. Real-Time Live Tracking

```mermaid
sequenceDiagram
    autonumber
    actor Public as Public Customer (Track Page)
    actor Admin as Admin Dashboard
    actor Agent as Delivery Agent (Portal)
    participant IO as Socket.IO Server
    participant API as Express API (/api/deliveries)
    participant DB as PostgreSQL (Prisma)

    Note over Public,IO: Public customer searches trackingNumber (or switches to a new one)
    opt Previously subscribed to another trackingNumber
        Public->>IO: socket.emit("tracking:unsubscribe", prevTrackingNumber)
        IO->>IO: socket.leave("parcel:" + prevTrackingNumber)
    end

    Public->>API: GET /api/tracking/PT-20261126-0001
    API->>DB: Fetch Parcel + TrackingEvents + Checkpoints
    DB-->>API: Sanitized parcel data (no deliveryPin)
    API-->>Public: 200 OK
    Public->>IO: socket.emit("tracking:subscribe", "PT-20261126-0001")
    IO->>IO: socket.join("parcel:PT-20261126-0001")

    Note over Admin,IO: Admin connects with JWT
    Admin->>IO: Connect with handshake.auth.token (ADMIN)
    IO->>IO: Verify JWT -> socket.join("admin")

    Note over Agent,DB: Agent updates parcel status
    Agent->>API: PATCH /api/deliveries/:parcelId/status { status: "OUT_FOR_DELIVERY", locationName, lat, lng, notes }
    API->>API: Verify JWT (AGENT), ownership & valid transition
    API->>DB: prisma.$transaction: update Parcel(status), update Delivery(IN_PROGRESS), create TrackingEvent
    DB-->>API: Committed { parcel, trackingEvent }

    par Broadcast to Admin & Public Subscribers
        API->>IO: Emit "parcel:updated" -> room "admin"
        IO-->>Admin: { parcelId, trackingNumber, status, latestEvent, updatedAt }
    and
        API->>IO: Emit "parcel:updated" -> room "parcel:PT-20261126-0001"
        IO-->>Public: { parcelId, trackingNumber, status, latestEvent, updatedAt }
    end

    API-->>Agent: 200 OK { parcel, trackingEvent }

    Note over Public,IO: Cleanup on page unmount
    Public->>IO: socket.emit("tracking:unsubscribe", "PT-20261126-0001")
    IO->>IO: socket.leave("parcel:PT-20261126-0001")
```

**Design Rationale:**
Room-scoped Socket.IO broadcasts (`admin` and `parcel:<trackingNumber>`) ensure customers only receive updates for the shipment they are actively viewing while admins receive fleet-wide updates. Symmetric `tracking:subscribe` and `tracking:unsubscribe` calls prevent room accumulation and duplicate UI updates when a user searches multiple tracking numbers in one session.

---

## 3. Full Parcel Lifecycle (Master Demo Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin (Dashboard)
    actor Agent as Delivery Agent (Portal)
    actor Public as Public Customer (Track Page)
    participant API as Express API
    participant DB as PostgreSQL (Prisma)
    participant IO as Socket.IO Server

    Note over Admin,IO: Step 1 - Admin registers a new parcel
    Admin->>API: POST /api/parcels { sender, recipient, pickup, destination, weightKg, deliveryType }
    API->>DB: prisma.$transaction: create Parcel(PENDING, trackingNumber, deliveryPin) + create TrackingEvent(PENDING)
    DB-->>API: Committed { parcel, trackingEvent }
    API->>IO: Emit "parcel:created" -> room "admin"
    IO-->>Admin: { parcel, statsDelta: { total: +1, pending: +1 } }
    API-->>Admin: 201 Created { parcel }

    Note over Admin,IO: Step 2 - Admin assigns parcel to Agent
    Admin->>API: POST /api/deliveries/assign { parcelId, agentId }
    API->>DB: prisma.$transaction: upsert Delivery(ASSIGNED, agentId)
    DB-->>API: Committed { delivery }
    API->>IO: Emit "parcel:assigned" -> rooms "admin" & "agent:<agentId>"
    IO-->>Admin: { parcelId, trackingNumber, agentId, agentName }
    IO-->>Agent: { parcelId, trackingNumber, agentId, agentName }
    API-->>Admin: 200 OK { delivery }

    Note over Agent,IO: Step 3 - Agent picks up parcel
    Agent->>API: PATCH /api/deliveries/:parcelId/status { status: "PICKED_UP", locationName, lat, lng, notes }
    API->>DB: prisma.$transaction: update Parcel(PICKED_UP), update Delivery(IN_PROGRESS), create TrackingEvent(PICKED_UP)
    DB-->>API: Committed { parcel, trackingEvent }
    API->>IO: Emit "parcel:updated" -> rooms "admin" & "parcel:<trackingNumber>"
    IO-->>Admin: { parcelId, trackingNumber, status: "PICKED_UP", latestEvent, updatedAt }
    IO-->>Public: { parcelId, trackingNumber, status: "PICKED_UP", latestEvent, updatedAt }
    API-->>Agent: 200 OK

    Note over Agent,IO: Step 4 (Optional Sad Path) - Agent records failed attempt
    Agent->>API: POST /api/deliveries/:parcelId/attempt { failureReason: "Recipient unavailable", locationName, lat, lng }
    API->>DB: prisma.$transaction: update Delivery(FAILED, attemptCount + 1), update Parcel(FAILED_ATTEMPT), create TrackingEvent(FAILED_ATTEMPT)
    DB-->>API: Committed { parcel, delivery, trackingEvent }
    API->>IO: Emit "parcel:updated" -> rooms "admin" & "parcel:<trackingNumber>"
    IO-->>Admin: { parcelId, trackingNumber, status: "FAILED_ATTEMPT", latestEvent, updatedAt }
    IO-->>Public: { parcelId, trackingNumber, status: "FAILED_ATTEMPT", latestEvent, updatedAt }
    API-->>Agent: 200 OK

    Note over Agent,IO: Step 5 - Agent confirms delivery with valid PIN
    Agent->>API: POST /api/deliveries/:parcelId/confirm { recipientName, pin, notes }
    API->>DB: prisma.$transaction: create ProofOfDelivery(DELIVERED), update Delivery(COMPLETED), update Parcel(DELIVERED), create TrackingEvent(DELIVERED)
    DB-->>API: Committed { parcel, proofOfDelivery, trackingEvent }
    API->>IO: Emit "parcel:delivered" -> rooms "admin" & "parcel:<trackingNumber>"
    IO-->>Admin: { parcelId, trackingNumber, proofOfDelivery, deliveredAt }
    IO-->>Public: { parcelId, trackingNumber, proofOfDelivery, deliveredAt }
    API-->>Agent: 200 OK
```

**Design Rationale:**
Every database write that alters shipment state (`parcel:created`, `parcel:assigned`, `parcel:updated`, `parcel:delivered`) executes inside a Prisma transaction and emits its corresponding Socket.IO event only after commit. This guarantees connected clients never render optimistic or stale state if a database write fails.
