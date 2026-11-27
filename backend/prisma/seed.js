const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ParcelTrack database...');

  // 1. Users (1 Admin, 2 Agents)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@parceltrack.dev' },
    update: {
      name: 'Kojo Asante',
      phone: '+233201234567',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      name: 'Kojo Asante',
      email: 'admin@parceltrack.dev',
      phone: '+233201234567',
      passwordHash: bcrypt.hashSync('admin123', 10),
      role: 'ADMIN',
      isActive: true,
    },
  });

  const agent1 = await prisma.user.upsert({
    where: { email: 'agent1@parceltrack.dev' },
    update: {
      name: 'Kwame Mensah',
      phone: '+233241111111',
      passwordHash: bcrypt.hashSync('agent123', 10),
      role: 'AGENT',
      vehicleInfo: 'Van - GT 4521-24',
      zone: 'Accra',
      isActive: true,
    },
    create: {
      name: 'Kwame Mensah',
      email: 'agent1@parceltrack.dev',
      phone: '+233241111111',
      passwordHash: bcrypt.hashSync('agent123', 10),
      role: 'AGENT',
      vehicleInfo: 'Van - GT 4521-24',
      zone: 'Accra',
      isActive: true,
    },
  });

  const agent2 = await prisma.user.upsert({
    where: { email: 'agent2@parceltrack.dev' },
    update: {
      name: 'Ama Owusu',
      phone: '+233242222222',
      passwordHash: bcrypt.hashSync('agent123', 10),
      role: 'AGENT',
      vehicleInfo: 'Motorbike - M-234-24',
      zone: 'Kumasi',
      isActive: true,
    },
    create: {
      name: 'Ama Owusu',
      email: 'agent2@parceltrack.dev',
      phone: '+233242222222',
      passwordHash: bcrypt.hashSync('agent123', 10),
      role: 'AGENT',
      vehicleInfo: 'Motorbike - M-234-24',
      zone: 'Kumasi',
      isActive: true,
    },
  });

  // 2. Checkpoints (4)
  const checkpointData = [
    {
      code: 'ACC-HUB',
      name: 'Accra Central Hub',
      type: 'PICKUP_HUB',
      city: 'Accra',
      address: '12 Independence Ave',
      lat: 5.6037,
      lng: -0.187,
    },
    {
      code: 'KUM-SC',
      name: 'Kumasi Sorting Centre',
      type: 'SORTING_CENTRE',
      city: 'Kumasi',
      address: '45 Prempeh II St',
      lat: 6.6885,
      lng: -1.6244,
    },
    {
      code: 'TAM-DB',
      name: 'Tamale Dispatch Branch',
      type: 'DISPATCH_BRANCH',
      city: 'Tamale',
      address: '8 Bolgatanga Rd',
      lat: 9.4008,
      lng: -0.8393,
    },
    {
      code: 'TAK-HUB',
      name: 'Takoradi Regional Hub',
      type: 'SORTING_CENTRE',
      city: 'Takoradi',
      address: '22 Market Circle',
      lat: 4.9016,
      lng: -1.7831,
    },
  ];

  const checkpoints = {};
  for (const cp of checkpointData) {
    checkpoints[cp.code] = await prisma.checkpoint.upsert({
      where: { code: cp.code },
      update: cp,
      create: cp,
    });
  }

  // 3. Parcels (7 — one in each ParcelStatus)
  const estDelivery = new Date('2026-12-05T17:00:00Z');
  const parcelDefs = [
    {
      trackingNumber: 'PT-20261127-0001',
      senderName: 'Kofi Boateng',
      senderPhone: '+233208112233',
      pickupAddress: '12 Independence Ave, Accra',
      pickupLat: 5.6037,
      pickupLng: -0.187,
      recipientName: 'Abena Serwaa',
      recipientPhone: '+233244556677',
      destinationAddress: '18 Harper Rd, Adum, Kumasi',
      destinationLat: 6.6885,
      destinationLng: -1.6244,
      weightKg: 2.5,
      deliveryType: 'STANDARD',
      status: 'PENDING',
      deliveryPin: '1234',
      estimatedDeliveryAt: estDelivery,
      currentCheckpointId: checkpoints['ACC-HUB'].id,
      createdById: admin.id,
      routeGeometry: {
        type: 'LineString',
        coordinates: [
          [-0.187, 5.6037],
          [-0.78, 6.12],
          [-1.6244, 6.6885],
        ],
      },
    },
    {
      trackingNumber: 'PT-20261127-0002',
      senderName: 'Yaw Adjei',
      senderPhone: '+233277001122',
      pickupAddress: '12 Independence Ave, Accra',
      pickupLat: 5.6037,
      pickupLng: -0.187,
      recipientName: 'Ibrahim Fuseini',
      recipientPhone: '+233249887766',
      destinationAddress: '8 Bolgatanga Rd, Tamale',
      destinationLat: 9.4008,
      destinationLng: -0.8393,
      weightKg: 1.2,
      deliveryType: 'EXPRESS',
      status: 'PICKED_UP',
      deliveryPin: '1234',
      estimatedDeliveryAt: estDelivery,
      currentCheckpointId: checkpoints['ACC-HUB'].id,
      createdById: admin.id,
      routeGeometry: {
        type: 'LineString',
        coordinates: [
          [-0.187, 5.6037],
          [-0.95, 7.45],
          [-0.8393, 9.4008],
        ],
      },
    },
    {
      trackingNumber: 'PT-20261127-0003',
      senderName: 'Efua Mensah',
      senderPhone: '+233203344556',
      pickupAddress: '12 Independence Ave, Accra',
      pickupLat: 5.6037,
      pickupLng: -0.187,
      recipientName: 'Nana Osei',
      recipientPhone: '+233245667788',
      destinationAddress: '45 Prempeh II St, Kumasi',
      destinationLat: 6.6885,
      destinationLng: -1.6244,
      weightKg: 4.8,
      deliveryType: 'STANDARD',
      status: 'IN_TRANSIT',
      deliveryPin: '1234',
      estimatedDeliveryAt: estDelivery,
      currentCheckpointId: checkpoints['KUM-SC'].id,
      createdById: admin.id,
      routeGeometry: {
        type: 'LineString',
        coordinates: [
          [-0.187, 5.6037],
          [-0.78, 6.12],
          [-1.6244, 6.6885],
        ],
      },
    },
    {
      trackingNumber: 'PT-20261127-0004',
      senderName: 'Daniel Tetteh',
      senderPhone: '+233261234987',
      pickupAddress: '45 Prempeh II St, Kumasi',
      pickupLat: 6.6885,
      pickupLng: -1.6244,
      recipientName: 'Esi Arthur',
      recipientPhone: '+233209876543',
      destinationAddress: '22 Market Circle, Takoradi',
      destinationLat: 4.9016,
      destinationLng: -1.7831,
      weightKg: 0.7,
      deliveryType: 'SAME_DAY',
      status: 'OUT_FOR_DELIVERY',
      deliveryPin: '1234',
      estimatedDeliveryAt: estDelivery,
      currentCheckpointId: checkpoints['TAK-HUB'].id,
      createdById: admin.id,
      routeGeometry: {
        type: 'LineString',
        coordinates: [
          [-1.6244, 6.6885],
          [-1.71, 5.79],
          [-1.7831, 4.9016],
        ],
      },
    },
    {
      trackingNumber: 'PT-20261127-0005',
      senderName: 'Nii Armah',
      senderPhone: '+233243210987',
      pickupAddress: '12 Independence Ave, Accra',
      pickupLat: 5.6037,
      pickupLng: -0.187,
      recipientName: 'Akosua Boateng',
      recipientPhone: '+233248765432',
      destinationAddress: '22 Market Circle, Takoradi',
      destinationLat: 4.9016,
      destinationLng: -1.7831,
      weightKg: 3.1,
      deliveryType: 'STANDARD',
      status: 'DELIVERED',
      deliveryPin: '5678',
      estimatedDeliveryAt: estDelivery,
      currentCheckpointId: checkpoints['TAK-HUB'].id,
      createdById: admin.id,
      routeGeometry: {
        type: 'LineString',
        coordinates: [
          [-0.187, 5.6037],
          [-1.02, 5.21],
          [-1.7831, 4.9016],
        ],
      },
    },
    {
      trackingNumber: 'PT-20261127-0006',
      senderName: 'Adwoa Darko',
      senderPhone: '+233205551234',
      pickupAddress: '45 Prempeh II St, Kumasi',
      pickupLat: 6.6885,
      pickupLng: -1.6244,
      recipientName: 'Michael Quaye',
      recipientPhone: '+233247778899',
      destinationAddress: '14 Oxford St, Osu, Accra',
      destinationLat: 5.6037,
      destinationLng: -0.187,
      weightKg: 2.0,
      deliveryType: 'EXPRESS',
      status: 'FAILED_ATTEMPT',
      deliveryPin: '5678',
      estimatedDeliveryAt: estDelivery,
      currentCheckpointId: checkpoints['ACC-HUB'].id,
      createdById: admin.id,
      routeGeometry: {
        type: 'LineString',
        coordinates: [
          [-1.6244, 6.6885],
          [-0.78, 6.12],
          [-0.187, 5.6037],
        ],
      },
    },
    {
      trackingNumber: 'PT-20261127-0007',
      senderName: 'Sulemana Alhassan',
      senderPhone: '+233246669900',
      pickupAddress: '8 Bolgatanga Rd, Tamale',
      pickupLat: 9.4008,
      pickupLng: -0.8393,
      recipientName: 'Grace Lamptey',
      recipientPhone: '+233202223344',
      destinationAddress: '12 Independence Ave, Accra',
      destinationLat: 5.6037,
      destinationLng: -0.187,
      weightKg: 1.5,
      deliveryType: 'STANDARD',
      status: 'RETURNED',
      deliveryPin: '5678',
      estimatedDeliveryAt: estDelivery,
      currentCheckpointId: checkpoints['ACC-HUB'].id,
      createdById: admin.id,
      routeGeometry: {
        type: 'LineString',
        coordinates: [
          [-0.8393, 9.4008],
          [-0.95, 7.45],
          [-0.187, 5.6037],
        ],
      },
    },
  ];

  const parcels = {};
  for (const p of parcelDefs) {
    parcels[p.trackingNumber] = await prisma.parcel.upsert({
      where: { trackingNumber: p.trackingNumber },
      update: p,
      create: p,
    });
  }

  // 4. TrackingEvents (delete existing for these 7 parcels, then recreate >= 10)
  const parcelIds = Object.values(parcels).map((p) => p.id);
  await prisma.trackingEvent.deleteMany({
    where: { parcelId: { in: parcelIds } },
  });

  const now = Date.now();
  const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000);

  await prisma.trackingEvent.createMany({
    data: [
      {
        parcelId: parcels['PT-20261127-0001'].id,
        checkpointId: checkpoints['ACC-HUB'].id,
        status: 'PENDING',
        locationName: 'Accra Central Hub',
        lat: 5.6037,
        lng: -0.187,
        notes: 'Parcel registered and awaiting pickup',
        createdById: admin.id,
        createdAt: hoursAgo(6),
      },
      {
        parcelId: parcels['PT-20261127-0002'].id,
        checkpointId: checkpoints['ACC-HUB'].id,
        status: 'PENDING',
        locationName: 'Accra Central Hub',
        lat: 5.6037,
        lng: -0.187,
        notes: 'Parcel registered',
        createdById: admin.id,
        createdAt: hoursAgo(30),
      },
      {
        parcelId: parcels['PT-20261127-0002'].id,
        checkpointId: checkpoints['ACC-HUB'].id,
        status: 'PICKED_UP',
        locationName: 'Accra Central Hub',
        lat: 5.6037,
        lng: -0.187,
        notes: 'Picked up by courier Kwame Mensah',
        createdById: admin.id,
        createdAt: hoursAgo(18),
      },
      {
        parcelId: parcels['PT-20261127-0003'].id,
        checkpointId: checkpoints['ACC-HUB'].id,
        status: 'PICKED_UP',
        locationName: 'Accra Central Hub',
        lat: 5.6037,
        lng: -0.187,
        notes: 'Picked up from sender at Accra Central Hub',
        createdById: admin.id,
        createdAt: hoursAgo(48),
      },
      {
        parcelId: parcels['PT-20261127-0003'].id,
        checkpointId: checkpoints['KUM-SC'].id,
        status: 'IN_TRANSIT',
        locationName: 'Kumasi Sorting Centre',
        lat: 6.6885,
        lng: -1.6244,
        notes: 'Arrived at Kumasi Sorting Centre for dispatch',
        createdById: admin.id,
        createdAt: hoursAgo(12),
      },
      {
        parcelId: parcels['PT-20261127-0004'].id,
        checkpointId: checkpoints['KUM-SC'].id,
        status: 'IN_TRANSIT',
        locationName: 'Kumasi Sorting Centre',
        lat: 6.6885,
        lng: -1.6244,
        notes: 'Departed Kumasi Sorting Centre',
        createdById: admin.id,
        createdAt: hoursAgo(10),
      },
      {
        parcelId: parcels['PT-20261127-0004'].id,
        checkpointId: checkpoints['TAK-HUB'].id,
        status: 'OUT_FOR_DELIVERY',
        locationName: 'Takoradi Regional Hub',
        lat: 4.9016,
        lng: -1.7831,
        notes: 'Out for same-day delivery in Takoradi',
        createdById: admin.id,
        createdAt: hoursAgo(2),
      },
      {
        parcelId: parcels['PT-20261127-0005'].id,
        checkpointId: checkpoints['ACC-HUB'].id,
        status: 'IN_TRANSIT',
        locationName: 'Accra Central Hub',
        lat: 5.6037,
        lng: -0.187,
        notes: 'Dispatched toward Takoradi',
        createdById: admin.id,
        createdAt: hoursAgo(72),
      },
      {
        parcelId: parcels['PT-20261127-0005'].id,
        checkpointId: checkpoints['TAK-HUB'].id,
        status: 'DELIVERED',
        locationName: 'Takoradi Regional Hub',
        lat: 4.9016,
        lng: -1.7831,
        notes: 'Delivered to recipient Akosua Boateng with PIN verification',
        createdById: admin.id,
        createdAt: new Date('2026-11-25T14:30:00Z'),
      },
      {
        parcelId: parcels['PT-20261127-0006'].id,
        checkpointId: checkpoints['ACC-HUB'].id,
        status: 'FAILED_ATTEMPT',
        locationName: 'Accra Central Hub',
        lat: 5.6037,
        lng: -0.187,
        notes: 'Delivery attempt failed: Recipient unavailable',
        createdById: admin.id,
        createdAt: hoursAgo(5),
      },
      {
        parcelId: parcels['PT-20261127-0007'].id,
        checkpointId: checkpoints['TAM-DB'].id,
        status: 'IN_TRANSIT',
        locationName: 'Tamale Dispatch Branch',
        lat: 9.4008,
        lng: -0.8393,
        notes: 'Departed Tamale Dispatch Branch',
        createdById: admin.id,
        createdAt: hoursAgo(60),
      },
      {
        parcelId: parcels['PT-20261127-0007'].id,
        checkpointId: checkpoints['ACC-HUB'].id,
        status: 'RETURNED',
        locationName: 'Accra Central Hub',
        lat: 5.6037,
        lng: -0.187,
        notes: 'Returned to Accra Central Hub after uncollected window',
        createdById: admin.id,
        createdAt: hoursAgo(4),
      },
    ],
  });

  // 5. Deliveries (4)
  await prisma.delivery.upsert({
    where: { parcelId: parcels['PT-20261127-0002'].id },
    update: {
      agentId: agent1.id,
      assignedById: admin.id,
      status: 'ASSIGNED',
      attemptCount: 0,
      pinAttempts: 0,
      failureReason: null,
    },
    create: {
      parcelId: parcels['PT-20261127-0002'].id,
      agentId: agent1.id,
      assignedById: admin.id,
      status: 'ASSIGNED',
      attemptCount: 0,
      pinAttempts: 0,
    },
  });

  await prisma.delivery.upsert({
    where: { parcelId: parcels['PT-20261127-0004'].id },
    update: {
      agentId: agent2.id,
      assignedById: admin.id,
      status: 'IN_PROGRESS',
      attemptCount: 0,
      pinAttempts: 0,
      failureReason: null,
    },
    create: {
      parcelId: parcels['PT-20261127-0004'].id,
      agentId: agent2.id,
      assignedById: admin.id,
      status: 'IN_PROGRESS',
      attemptCount: 0,
      pinAttempts: 0,
    },
  });

  const delivery5 = await prisma.delivery.upsert({
    where: { parcelId: parcels['PT-20261127-0005'].id },
    update: {
      agentId: agent1.id,
      assignedById: admin.id,
      status: 'COMPLETED',
      attemptCount: 1,
      pinAttempts: 0,
      failureReason: null,
    },
    create: {
      parcelId: parcels['PT-20261127-0005'].id,
      agentId: agent1.id,
      assignedById: admin.id,
      status: 'COMPLETED',
      attemptCount: 1,
      pinAttempts: 0,
    },
  });

  await prisma.delivery.upsert({
    where: { parcelId: parcels['PT-20261127-0006'].id },
    update: {
      agentId: agent2.id,
      assignedById: admin.id,
      status: 'FAILED',
      attemptCount: 1,
      pinAttempts: 0,
      failureReason: 'Recipient unavailable',
    },
    create: {
      parcelId: parcels['PT-20261127-0006'].id,
      agentId: agent2.id,
      assignedById: admin.id,
      status: 'FAILED',
      attemptCount: 1,
      pinAttempts: 0,
      failureReason: 'Recipient unavailable',
    },
  });

  // 6. ProofOfDelivery (1 — for Parcel #5)
  await prisma.proofOfDelivery.upsert({
    where: { parcelId: parcels['PT-20261127-0005'].id },
    update: {
      deliveryId: delivery5.id,
      recipientName: 'Akosua Boateng',
      pinVerified: true,
      outcome: 'DELIVERED',
      notes: 'Delivered to recipient at door',
      deliveredAt: new Date('2026-11-25T14:30:00Z'),
    },
    create: {
      deliveryId: delivery5.id,
      parcelId: parcels['PT-20261127-0005'].id,
      recipientName: 'Akosua Boateng',
      pinVerified: true,
      outcome: 'DELIVERED',
      notes: 'Delivered to recipient at door',
      deliveredAt: new Date('2026-11-25T14:30:00Z'),
    },
  });

  console.log('Seed completed: 3 users, 4 checkpoints, 7 parcels, 12 tracking events, 4 deliveries, 1 POD.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
