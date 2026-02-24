const express = require('express');
const checkoutController = require('../controllers/checkoutController');
const authenticate = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const { checkoutPreviewSchema } = require('../utils/validationSchemas');

const router = express.Router();

router.post(
  '/preview',
  authenticate,
  validateRequest(checkoutPreviewSchema),
  checkoutController.preview
);

module.exports = router;
