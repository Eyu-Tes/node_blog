const express = require('express')
const {
    showHomePage, 
    showAboutPage, 
    showContactPage
} = require('../controllers/index')

// initialize router
const router = express.Router()

// @route   GET /
router.get('/', showHomePage)

// @route   GET /about      
router.get('/about', showAboutPage)

// @route   GET /contact
router.get('/contact', showContactPage)

module.exports = router
