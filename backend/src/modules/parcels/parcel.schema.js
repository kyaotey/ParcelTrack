const { z } = require('zod');

const createParcelSchema = z.object({
  senderName: z.string().trim().min(1, 'Sender name is required'),
  senderPhone: z.string().trim().min(10, 'Sender phone is required'),
  pickupAddress: z.string().trim().min(5, 'Pickup address is required'),
  pickupLat: z.number().min(-90).max(90),
  pickupLng: z.number().min(-180).max(180),
  recipientName: z.string().trim().min(1, 'Recipient name is required'),
  recipientPhone: z.string().trim().min(10, 'Recipient phone is required'),
  destinationAddress: z.string().trim().min(5, 'Destination address is required'),
  destinationLat: z.number().min(-90).max(90),
  destinationLng: z.number().min(-180).max(180),
  weightKg: z.number().positive('Weight must be positive'),
  deliveryType: z.enum(['STANDARD', 'EXPRESS', 'SAME_DAY']).default('STANDARD'),
  estimatedDeliveryAt: z.string().datetime('Invalid ISO date'),
  routeGeometry: z.object({
    type: z.literal('LineString'),
    coordinates: z
      .array(z.tuple([z.number(), z.number()]))
      .min(2, 'At least 2 coordinates required'),
  }),
});

module.exports = { createParcelSchema };
