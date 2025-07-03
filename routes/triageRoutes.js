// backend/routes/triageRoutes.js
const express = require('express');
const router = express.Router();
const { assessPatient } = require('../controllers/triageController');

router.post('/', assessPatient);

module.exports = router;
