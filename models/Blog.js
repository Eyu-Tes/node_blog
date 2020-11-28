const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')

const BlogSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: [true, 'title cannot be empty'], 
        trim: true
    }, 
    content: {
        type: String, 
        required: true
    }, 
    categories: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Category'
        }
    ], 
    status: {
        type: String, 
        enum: ['public', 'private'],
        default: 'public'
    }, 
    author: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true
    }, 
    slug: {
        type: String,
        slug: "title",
        // If unique is set, & slug already exists in the collection, 
        // it appends to the slug a separator (default: “-”) & random string (generated with shortid module)
        unique: true
    }
}, 
{
    timestamps: {
        createdAt: 'datePublished', 
        updatedAt: 'lastModified', 
    }
})

//Initialize slug generator plugin
mongoose.plugin(slug)

// const Category = require('./Category')
// Delete corresponding categories whenever a blog is deleted
// cascading delete (in this case removes records with a m:n relation)
// BlogSchema.post('findOneAndDelete', async function(doc, next) {
//     try {
//         await Category.deleteMany({_id: {$in: doc.categories}})
//         next()
//     } catch (err) {
//         return next(err)
//     }
// })

module.exports = mongoose.model('Blog', BlogSchema)
