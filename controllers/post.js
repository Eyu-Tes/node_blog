const Post = require('../models/Post')
const Category = require('../models/Category')

// get all categories
const getCategories = async () => {
    return await 
    Category.find()
        .sort({name: 'asc'})
        .collation({ locale: "en" })            // sort with case insensitive manner
        .lean()
}
const statuses = Post.schema.path('status').enumValues

// @desc    show post create page
module.exports.showCreatePostPage = async (req, res) => {
    const allCategories = await getCategories()
    res.render('post/add', {
        allCategories, 
        statuses
    })
}

// @desc    create post
module.exports.createPost = async (req, res) => {
    const allCategories = await getCategories()
    try {
        req.body.author = req.user.id
        const newPost = new Post({...req.body})
        let error = newPost.validateSync()
        if(error) throw(error)
        await newPost.save()
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
