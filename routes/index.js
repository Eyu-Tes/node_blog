const express = require('express')
const {
    showAboutPage, 
    showContactPage,
} = require('../controllers/index')

const { showPublicPosts } = require('../controllers/post')

// initialize router
const router = express.Router()

// @route   GET /
router.get('/', showPublicPosts)

// @route   GET /about      
router.get('/about', showAboutPage)

// @route   GET /contact
router.get('/contact', showContactPage)

module.exports = router
