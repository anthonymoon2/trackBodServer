const express = require('express')
const router = express.Router()
const scanController = require('../controllers/scanController')

// authenticate middlware
const authenticate = require('../middlewares/authMiddleware');

// ADD INDIVIDUAL SCAN TO DATABASE
router.post('/saveScan', authenticate, scanController.saveScan)

// DELETE INDIVIDUAL SCAN IN DATABASE ALONG WITH PHOTOS IN AWS
// /api/scan/:scan_id
router.delete('/:scan_id', authenticate, scanController.deleteScan)

router.get('/getAllUserScans', authenticate, scanController.getAllUserScans)

// /api/scan/getScanPhotos
router.get('/getScanPhotos', authenticate, scanController.getScanPhotos)

module.exports = router