const express = require('express')

const {ensureAuth} = require('../middleware/auth')

const {
    showCreatePostPage, 
    createPost
} = require('../controllers/post')

const router = express.Router()

// @route   /post/add
router.route('/add')
.get(ensureAuth, showCreatePostPage)        // @method  GET
.post(ensureAuth, createPost)               // @method  POST

module.exports = router
