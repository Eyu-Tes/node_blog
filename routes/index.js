const express = require('express')
const {showHomePage} = require('../controllers/index')

// initialize router
const router = express.Router()

// @route   GET /
router.get('/', showHomePage)

module.exports = router
