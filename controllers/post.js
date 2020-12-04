const Post = require('../models/Post')
const Category = require('../models/Category')
const NotFoundError = require('./helpers/cusomtError')        // custom error message

// get all categories
const getAllCategories = async () => {
    return await 
    Category.find()
        .sort({name: 'asc'})
        .collation({ locale: "en" })            // sort with case insensitive manner
        .lean()
}
const statuses = Post.schema.path('status').enumValues

// @desc    show post create page
module.exports.showCreatePostPage = async (req, res) => {
    const allCategories = await getAllCategories()
    res.render('post/add', {
        allCategories, 
        statuses
    })
}

// @desc    create post
module.exports.createPost = async (req, res) => {
    const allCategories = await getAllCategories()
    try {
        req.body.author = req.user.id
        const newPost = new Post({...req.body})
        let error = newPost.validateSync()
        if(error) throw(error)
        await newPost.save()
        req.flash('success_msg', 'you have created a new post.')
        res.redirect('/')
    } catch (error) {
        res.render('post/add', {
            ...req.body, 
            ...error, 
            allCategories, 
            statuses
        })
    }
}

// @desc    show post update page
module.exports.showUpdatePostPage = async (req, res) => {
    try {
        const allCategories = await getAllCategories()
        const post = await Post.findById(req.params.id).lean()
        if(!post) throw ('post not found')
        
        /* ---------- get previously selected categories from category document ---------- */
        let selectedCategories = []
        const targetPost = await Post.findOne({_id: req.params.id})
            .populate('categories _id').exec() || {categories: []}
        await targetPost.categories.forEach(async category => {
            await selectedCategories.push(String(category._id))
        })
        /* ------------------------------------------------------------------------------ */
        res.render('post/edit', {
            ...post,
            allCategories, 
            selectedCategories,
            statuses
        })
    } catch (err) {  
        // "Invalid id length" needs to be caught separately
        if(err.name === 'CastError') {
            console.log(`${err.name}: ${err.message}`)
            req.flash('failure_msg', "Invalid id length")
        }
        else {
            req.flash('failure_msg', err)
        }
        res.redirect('/')
    }
}

// @desc    update post
module.exports.updatePost = async (req, res) => {
    const id = req.params.id
    const allCategories = await getAllCategories()
    // get previously selected categories from request body
    let selectedCategories = req.body.categories
    // if request body doesn't have the categories attribute, create one and make it empty array
    req.body.categories = selectedCategories || []
    try {
        const updatedPost = await Post.findOneAndUpdate({_id: id}, req.body, {
            // return the modified document rather than the original
            new: true,
            // runs validators 
            runValidators: true,
            // prevents the error: Cannot read property 'ownerDocument' of null
            // lets you set the value of 'this' in update validators to the underlying query.
            context: 'query'
        })
        // if post not found throw custom error: "NotFoundError"
        if(!updatedPost) throw new NotFoundError('post not found')
        req.flash('success_msg', 'you have updated your post.')
        res.redirect('/')
    } catch (err) {
        // "Invalid id length" error needs to be caught separately, b|c it is throws implicitly by find methods
        // And "post not found" error is a custom error
        if(err.name === 'CastError' || err.name === 'NotFoundError') {
            // if CastError, override default message
            if(err.name === 'CastError') err.message = "Invalid id length"
            console.log(`${err.name}: ${err.message}`)
            req.flash('failure_msg', err.message)
            res.redirect('/')
            return
        }
        res.render('post/edit', {
            // _id must be passed since req.body will not contain it
            _id: id,
            ...req.body, 
            ...err, 
            allCategories, 
            selectedCategories,
            statuses
        })
    }
}

// @desc    show delete post modal
module.exports.showDeletePostModal = async (req, res) => {
    try {
        const post = await Post.findOne({_id: req.params.id}).lean()
        // if no posts found, throw custom error: "NotFoundError"
        if(!post) throw new NotFoundError('post not found')
        res.status(200).json({post})
    } catch (err) {
        if(err.name === 'CastError' || err.name === 'NotFoundError') {
            if(err.name === 'CastError') err.message = "Invalid id length"
            console.log(`${err.name}: ${err.message}`)
            res.status(404).json({'msg': err.message})
            return
        }
    }
}

// @desc    delete post
module.exports.deletePost = async (req, res) => {
    try {
        const result = await Post.deleteOne({_id: req.params.id})
        if(result.deletedCount !== 1) throw ('post not found')
        req.flash('success_msg', 'you have deleted a post.')
        res.redirect('/')
    } catch (err) {
        // "Invalid id length" error needs to be caught separately, b|c it is throws implicitly by find methods
        if(err.name === 'CastError') {
            err.message = "Invalid id length"
            req.flash('failure_msg', err.message)
            res.redirect('/')
            return
        }
        req.flash('failure_msg', err)
        res.redirect('/')
    }
}

// @desc    show public posts
module.exports.showPublicPosts = async (req, res) => {
    try {
        const posts = await Post.find({status: 'public'})
        .populate('author')
        .sort({datePublished: 'desc'})
        .lean()

        res.render('index', {
            posts
        })
    } catch (err) {
        console.log(err)
        res.render('index')
    }
}

// @desc    show post detail
module.exports.showPostDetail = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        .populate('author')
        .lean()

        // if post not found throw custom error: "NotFoundError"
        if(!post) throw new NotFoundError('post not found')
   
        // if post is private, make sure only the owner access it
        // we need to cast author id to String, inorder to compare with request user
        let userId = req.user ? req.user.id.toString() : ''
        if(userId !== post.author._id.toString() && post.status === 'private') {
            throw new NotFoundError('you cannot access this post')
        }

        res.render('post/detail', {
            post
        })
    } catch (err) {
        console.log(err)
        // "Invalid id length" error needs to be caught separately, b|c it is throws implicitly by find methods
        if(err.name === 'CastError' || err.name === 'NotFoundError') {
            if(err.name === 'CastError') err.message = "Invalid post id"
            console.log(`${err.name}: ${err.message}`)
            req.flash('failure_msg', err.message)
        }
        res.redirect('/')
    }
}

// @desc    show user's posts
module.exports.showUserPosts = async (req, res) => {
    try {
        // only include private posts if current user is the owner of the posts
        // add the 'public' status filter if current user doesn't own the posts
        let extraFilters = {}
        let userId = req.user ? req.user.id.toString() : ''
        if(userId !== req.params.id) {
            extraFilters.status = 'public'
        }

        const userPosts = await Post.find({author: req.params.id, ...extraFilters})
        .populate('author')
        .sort({datePublished: 'desc'})
        .lean()
        
        res.render('index', {
            posts: userPosts
        })
    } catch (err) {
        console.log(err)
        res.render('index')
    }
}
