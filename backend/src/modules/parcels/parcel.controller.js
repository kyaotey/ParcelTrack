const parcelService = require('./parcel.service');

async function create(req, res, next) {
  try {
    const { parcel, trackingEvent } = await parcelService.createParcel(req.body, req.user.id);
    return res.status(201).json({
      success: true,
      data: { parcel, trackingEvent },
    });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const parcels = await parcelService.listParcels();
    return res.status(200).json({
      success: true,
      data: { parcels, count: parcels.length },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list };
