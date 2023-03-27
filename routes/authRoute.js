const express = require('express')
const router = express.Router()

const AuthController = require('../controller/AuthController')

// Authentication functions routes set-up

router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.post('/searchUser', AuthController.searchUser)

module.exports = router