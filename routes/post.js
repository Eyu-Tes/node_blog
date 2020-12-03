const express = require('express')

const {ensureAuth} = require('../middleware/auth')

const {
    showCreatePostPage, 
    createPost, 
    showUpdatePostPage, 
    updatePost, 
    deletePost
} = require('../controllers/post')

const router = express.Router()

// @route   /post/add
router.route('/add')
.get(ensureAuth, showCreatePostPage)        // @method  GET
.post(ensureAuth, createPost)               // @method  POST

// @route   /post/:id/edit
router.route('/:id/edit')
.get(ensureAuth, showUpdatePostPage)        // @method  GET
.post(ensureAuth, updatePost)               // @method  POST

// @route   POST /post/:id/remove
router.post('/:id/remove', ensureAuth, deletePost)

module.exports = router
