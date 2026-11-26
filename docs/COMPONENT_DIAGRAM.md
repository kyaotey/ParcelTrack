# ParcelTrack — Component Diagram

## System Component Overview

```mermaid
flowchart LR
    subgraph Frontend["Frontend (React + Vite + Tailwind v4)"]
        AuthCtx["AuthContext (JWT)"]
        SocketCtx["SocketContext (WS)"]
        PublicRoutes["Public Routes (/track)"]
        AdminRoutes["Admin Routes (/admin/*)"]
        AgentRoutes["Agent Routes (/agent)"]
        ParcelMap["ParcelMap (MapLibre GL JS)"]

        PublicRoutes --> ParcelMap
        AdminRoutes --> ParcelMap
        PublicRoutes --> SocketCtx
        AdminRoutes --> AuthCtx
        AdminRoutes --> SocketCtx
        AgentRoutes --> AuthCtx
        AgentRoutes --> SocketCtx
    end

    subgraph API["API Layer (Express + Socket.IO)"]
        AuthMW["Auth & RBAC Middleware"]
        ZodVal["Zod Validators"]
        Routers["Module Routers\n(parcels, deliveries, tracking, agents, dashboard)"]
        RoomMgr["Socket.IO Room Manager\n(admin, agent, parcel)"]

        AuthMW --> ZodVal --> Routers
        Routers --> RoomMgr
    end

    subgraph Persistence["Persistence (Prisma v6 + PostgreSQL)"]
        UserM["User"]
        CheckpointM["Checkpoint"]
        ParcelM["Parcel"]
        EventM["TrackingEvent"]
        DeliveryM["Delivery"]
        PODM["ProofOfDelivery"]

        UserM -->|createdBy| ParcelM
        CheckpointM -->|currentCheckpoint| ParcelM
        ParcelM -->|history| EventM
        ParcelM -->|assigned| DeliveryM
        UserM -->|agent| DeliveryM
        DeliveryM -->|confirmed| PODM
    end

    subgraph External["External Services"]
        OpenFreeMap["OpenFreeMap Vector Tiles"]
    end

    Frontend -->|"/api/* (REST + JWT)"| AuthMW
    SocketCtx <-->|"/socket.io (WebSockets)"| RoomMgr
    Routers -->|Prisma Client| Persistence
    ParcelMap -->|"Style & Vector Tiles"| OpenFreeMap
```

## Architectural Boundaries

The React frontend communicates exclusively with the Express REST API and Socket.IO server through the Vite dev proxy, never touching Prisma or PostgreSQL directly so that all authentication, role-based access control, and Zod validation remain strictly server-enforced. Socket.IO shares the same Node.js HTTP server as Express, allowing REST controllers to emit room-scoped real-time events (`admin`, `agent:<id>`, `parcel:<trackingNumber>`) immediately after Prisma transactions commit. OpenFreeMap is the sole external runtime dependency, supplying free OpenStreetMap-based vector tiles directly to `ParcelMap` without API keys or paid mapping services.
