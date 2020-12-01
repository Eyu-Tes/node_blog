const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const {imageDelete} = require('../controllers/helpers/image')
const Post = require('./Post')

// email validator (needs to be place before UserSchema definition)
const validateEmail = (email) => {
    const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    return re.test(email)
}

// User schema
const UserSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: [true, 'username cannot be empty'], 
        maxlength: [30, 'username cannot exceed 30 characters'],
        trim: true
    }, 
    email: {
        type: String, 
        required: [true, 'email cannot be empty'], 
        unique: true,       // NB: 'unique' option for schemas is not a validator 
        validate: [validateEmail, 'please fill in a valid email address'],
        trim: true
    }, 
    avatar: {
        type: String
    }, 
    password: {
        type: String, 
        required: [true, 'password cannot be empty'], 
        minlength: [6, 'password must be atleast 6 characters long']
    }, 
    /* --- temporary password reset properties --- */
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
}, 
{
    timestamps: {
        createdAt: 'dateJoined', 
        updatedAt: false
    }
})

// ensure uniqueness of email fields
UserSchema.index({ email: 1 }, { unique: true})

// password hashing middleware before saving new records
// Don't use an arrow function for the callback, as it changes the scope of 'this'
UserSchema.pre('save', async function(next) {
    let user = this
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next()
    try {
        user.password = await user.hashPassword(user.password)
        next()
    } catch (err) {
        return next(err)
    }
})

// password hashing middleware before saving updated records
// Don't use an arrow function for the callback, as it changes the scope of 'this'
UserSchema.pre('findOneAndUpdate', async function (next) {
    let user = this
    try {
        if (user._update.password) {
            user._update.password = await user.schema.methods.hashPassword(user._update.password)
        }
        next()
    } catch (err) {
        return next(err)
    }
})

// Delete corresponding posts (cascading delete, 1:m) & image files whenever a user is deleted
UserSchema.post('findOneAndDelete', async function(doc, next) {
    try {
        await Post.deleteMany({author: doc._id})
        await imageDelete(doc.avatar)
        next()
    } catch (err) {
        return next(err)
    }
})

// hash password
UserSchema.methods.hashPassword = async (password) => {
    try {
        // generate a salt with rounds = 10
        const salt = await bcrypt.genSalt(10)
        // hash the password using our new salt
        const hash = await bcrypt.hash(password, salt)
        return hash
    } catch (err) {
        console.log(err)
        return null
    }
}

// check password
// Don't use an arrow function, as it changes the scope of 'this'
UserSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password)
        return isMatch
    } catch (err) {
        console.log(err)
        return null
    }
}

// User model
const User = mongoose.model('User', UserSchema)

module.exports = User
