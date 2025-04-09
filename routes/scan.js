const express = require('express')
const router = express.Router()
const scanController = require('../controllers/scanController')

// authenticate middlware
const authenticate = require('../middlewares/authMiddleware');

// ADD INDIVIDUAL SCAN TO DATABASE
// /api/scan/saveScan
router.post('/saveScan', authenticate, scanController.saveScan)

// DELETE INDIVIDUAL SCAN IN DATABASE ALONG WITH PHOTOS IN AWS
// /api/scan/:scan_id
router.delete('/:scan_id', authenticate, scanController.deleteScan)

// /api/scan/getAllUserScans
router.get('/getAllUserScans', authenticate, scanController.getAllUserScans)

// /api/scan/getMostRecentUserScan
router.get('/getMostRecentUserScan', authenticate, scanController.getMostRecentUserScan)

// /api/scan/getScanPhotos
router.get('/getScanPhotos', authenticate, scanController.getScanPhotos)

module.exports = router