const express = require('express')
const router = express.Router()
const photoController = require('../controllers/photoController')

// authenticate middlware
const authenticate = require('../middlewares/authMiddleware');

// UPLOAD PRODUCT PHOTO /api/photo/upload
router.post('/upload', photoController.upload)

module.exports = router