const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

// authenticate middlware
const authenticate = require('../middlewares/authMiddleware');


// GET ALL USER INFO
router.get('/getUser/:id', authenticate, userController.getUser)

// GET user weight by ID
router.get('/getWeight/:id', authenticate,  userController.getWeight);

// SET user weight by ID
router.put('/setWeight/:id', authenticate, userController.setWeight);

// SET user height by ID
router.put('/setHeight/:id', authenticate, userController.setHeight);

// SET user dateOfBirth by ID
router.put('/setdob/:id', authenticate, userController.setdob);

// SET user gender by ID
router.put('/setGender/:id', authenticate, userController.setGender);

// DELETE user by ID
// /api/user/deleteUser/:id
router.delete('/deleteUser/:id', authenticate, userController.deleteUser);


module.exports = router