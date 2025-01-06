const express = require('express')
const router = express.Router()

const authController = require('../controllers/authController')

// /api/auth/google
router.post('/google', authController.loginGoogle )

// /api/auth/apple
router.post('/apple', authController.loginApple )

module.exports = router

