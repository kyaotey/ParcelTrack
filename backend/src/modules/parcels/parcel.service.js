const prisma = require('../../config/prisma');
const { generateTrackingNumber, generateDeliveryPin } = require('../../utils/idGenerators');

async function createParcel(data, createdById) {
  const trackingNumber = generateTrackingNumber();
  const deliveryPin = generateDeliveryPin();

  const result = await prisma.$transaction(async (tx) => {
    const parcel = await tx.parcel.create({
      data: {
        trackingNumber,
        deliveryPin,
        senderName: data.senderName,
        senderPhone: data.senderPhone,
        pickupAddress: data.pickupAddress,
        pickupLat: data.pickupLat,
        pickupLng: data.pickupLng,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
        destinationAddress: data.destinationAddress,
        destinationLat: data.destinationLat,
        destinationLng: data.destinationLng,
        weightKg: data.weightKg,
        deliveryType: data.deliveryType,
        estimatedDeliveryAt: new Date(data.estimatedDeliveryAt),
        routeGeometry: data.routeGeometry,
        status: 'PENDING',
        currentCheckpointId: null,
        createdById,
      },
    });

    const trackingEvent = await tx.trackingEvent.create({
      data: {
        parcelId: parcel.id,
        status: 'PENDING',
        locationName: data.pickupAddress,
        lat: data.pickupLat,
        lng: data.pickupLng,
        notes: 'Parcel registered',
        createdById,
      },
    });

    return { parcel, trackingEvent };
  });

  return result;
}

async function listParcels() {
  return prisma.parcel.findMany({
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      currentCheckpoint: {
        select: { id: true, name: true, city: true },
      },
      delivery: {
        include: {
          agent: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

module.exports = {
  createParcel,
  listParcels,
};
