const express = require('express');
const { validate } = require('../../middleware/validate');
const { authenticate, authorize } = require('../../middleware/auth');
const { createParcelSchema } = require('./parcel.schema');
const parcelController = require('./parcel.controller');

const router = express.Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.post('/', validate(createParcelSchema), parcelController.create);
router.get('/', parcelController.list);

module.exports = router;
