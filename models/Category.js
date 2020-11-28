const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
    name: {
        type: String, 
        unique: true, 
        trim: true
    }, 
})

Category = mongoose.model('Category', CategorySchema)

let categories = ["IT", "sport", "politics", "business", "science", "entertainment"]

// populate categories collection with data
const buildCategories = async () => {
    try {
        x = new Date().getTime()
        const doc = await Category.findOne()
        // if collection is empty populate
        if(!doc) {
            categories.forEach(async category => {
                await Category.create({name: category})
            })
        } 
    } catch (err) {
        console.log(err)
    }
}

buildCategories()

module.exports = Category
