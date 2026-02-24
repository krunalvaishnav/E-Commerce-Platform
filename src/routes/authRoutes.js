const express = require('express');
const authController = require('../controllers/authController');
const validateRequest = require('../middlewares/validateRequest');
const { loginSchema, signupSchema } = require('../utils/validationSchemas');

const router = express.Router();

router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/signup', validateRequest(signupSchema), authController.signup);

module.exports = router;
