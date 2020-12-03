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
        req.body.author = id
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
        // "Invalid id length" error needs to be caught separately, b|c it is throws implicitly
        // And "post not found" error is a custom error
        if(err.name === 'CastError' || err.name === 'NotFoundError') {
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
