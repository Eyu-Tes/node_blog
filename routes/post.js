const express = require('express')

const {ensureAuth} = require('../middleware/auth')

const {
    showCreatePostPage, 
    createPost, 
    showUpdatePostPage, 
    updatePost, 
    showDeletePostModal,
    deletePost, 
    showPostDetail, 
    showUserPosts, 
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

// @route   /post/:id/remove
router.route('/:id/remove')
.get(ensureAuth, showDeletePostModal)        // @method  GET
.post(ensureAuth, deletePost)               // @method  POST

// @route   GET /post/:id
router.get('/:id', showPostDetail)

// @route   GET /post/user/:id
router.get('/user/:id', showUserPosts)

module.exports = router
