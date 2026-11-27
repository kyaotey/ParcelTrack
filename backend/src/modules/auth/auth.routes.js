const express = require('express');
const { validate } = require('../../middleware/validate');
const { loginSchema } = require('./auth.schema');
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.me);

module.exports = router;
