const crypto = require('crypto')
const {promisify} = require('util')
const path = require('path')
const passport = require('passport')

const {transporter} = require('../config/mail')

const User = require('../models/User')
const {imageResizeAndSave} = require('./helpers/image')

// @desc    show user signup page
module.exports.showSignupUserPage = (req, res) => res.render('account/signup')

// @desc    signup user
module.exports.signupUser = async (req, res) => {
    try {
        const newUser = new User({...req.body})
        let error = newUser.validateSync() || {errors: {}}
        if (!error.errors.password && req.body.password !== req.body.password2) {
            error.errors.password2 = 'passwords do not match'
            throw(error)
        }
        await newUser.save()
        req.flash('success_msg', "You're now registered. You can log in.")
        res.redirect('/account/signin')
    } catch (error) {
        // uniqueness error message
        if (error.name === 'MongoError' && error.code === 11000) {
            error = {errors: {email: 'user with this email already exists'}}
        }
        res.render('account/signup', {
            ...req.body, 
            ...error, 
            failure_msg: "Unable to create account. Follow the instrucitons."
        })
    }
}

// @desc    show user signin page
module.exports.showSigninUserPage = (req, res) => res.render('account/signin')

// @desc    signin user
module.exports.signinUser = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/', 
        successFlash: 'login successful',
        failureRedirect: '/account/signin', 
        failureFlash: true,     // message is generated from the passport LocalStrategy config
    })(req, res, next)
}

// @desc    signout user
module.exports.signoutUser = (req, res) => {
    // the passport middleware gives access to the logout function
    req.logout()
    req.flash('success_msg', 'you are logged out')
    res.redirect('/')
}

// @desc    show user profile page
module.exports.showProfilePage = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).lean()
        res.render('account/profile', {
            ...user, 
            avatar: user.avatar || 'default.png'
        })
    } catch (err) {
        res.redirect('/')
    }
}

// @desc    update user profile
module.exports.updateUser = async (req, res) => {
    user = req.user
    try {
        let newImagePath, oldImagePath
        if(req.file) {
            // newImagePath = 'user-<user_id>.ext'
            newImagePath = `user-${user.id}${path.extname(req.file.originalname)}`
            // oldImagePath = base name of existing path of avatar
            oldImagePath = user.avatar && path.basename(user.avatar)
        }
        else {
            newImagePath = user.avatar
        }
        const updatedUser = await User.findOneAndUpdate({_id: user.id}, {...req.body}, {
            // return the modified document rather than the original
            new: true,
            // runs validators 
            runValidators: true,
            // prevents the error: Cannot read property 'ownerDocument' of null
            // lets you set the value of 'this' in update validators to the underlying query.
            context: 'query'
        })
        if(req.file){
           let data = await imageResizeAndSave(req.file, newImagePath, oldImagePath)
           if (data) {
               /***  NB: u must add the leading slash '/' before 'uploads/...' 
                    Otherwise, it is going to cause error when searching the image
               ***/
               updatedUser.avatar = `/uploads/${newImagePath}`
               updatedUser.save()
           }
        }
        req.flash('success_msg', 'your profile has been updated')
        res.redirect('/account')
    } catch (error) {
        console.log(error)
        res.render('account/profile', {
            ...req.body, 
            avatar: user.avatar || 'default.png',
            ...error
        })
    }
}

// @desc    delete user account
module.exports.deleteUser = async (req, res) => {
    try {
        // use findOneAndDelete b|c we want the deleted doc to delete corresponding profile img
        await User.findOneAndDelete({_id: req.user.id})
        req.flash('success_msg', 'your account has been removed')
        res.redirect('/')
    } catch (error) {
        console.log(error)
    }
}

// @desc    show user password change page
module.exports.showChangeUserPasswordPage = (req, res) => {
    res.render('account/password/change')
}

// @desc    change user passowrd
module.exports.changePassword = async (req, res) => {
    try {
        let error = {errors:{}}
        const {old_password, password, password2} = req.body
        let user = await User.findById(req.user.id)
        console.log(user)
        // check password
        const isMatch = await user.comparePassword(old_password)
        if(isMatch) {
            if(password === password2) {
                user.password = req.body.password
                error = user.validateSync()
                if (error) throw (error)
                // hashing password is done in the pre-save middleware
                user.save()
                req.flash('success_msg', "password changed")
                res.redirect('/account')
            }
            else {
                error.errors['password2'] = 'passwords do not match'
                throw (error)
            }
        }
        else {
            error.errors['old_password'] = 'please enter your old password correctly'
            throw (error)
        }
    } catch(error) {
        res.render('account/password/change', {
            ...error
        })
    }
}


// @desc    show user password forgot page 
module.exports.showForgotPasswordPage = (req, res) => {
    res.render('account/password/forgot')
}

// @desc    send password reset email
module.exports.sendResetEmail = async (req, res) => {
    try {
        let error = {errors: {}}
        if (req.body.email.trim() === '') {
            error.errors['email'] = "field cannot be empty"
            throw (error)
        }
        const user = await User.findOne({email: req.body.email})
        if(!user) {
            error.errors['email'] = "there is no user with this email"
            throw (error)
        }
        // create token
        const token = (await promisify(crypto.randomBytes)(20)).toString('hex')
        user.resetPasswordToken = token
        user.resetPasswordExpires = Date.now() + 3600000    // expires in an hour
        await user.save()

        const resetEmail = {
            to: req.body.email,
            from: process.env.EMAIL_USER,
            subject: `Password reset on ${req.headers.host}`,
            text: `
                You are receiving this because you have requested a password reset for your account.
                Please click on the following link, or paste this into your browser to complete the process:
                http://${req.headers.host}/account/password/reset/${token}
                
                If you did not request this, please ignore this email and your password will remain unchanged.
            `,
        }
        await transporter.sendMail(resetEmail)
        res.render('account/password/email_sent')
    } catch (error) {
        console.log(error)
        res.render('account/password/forgot', {
            email: req.body.email,
            ...error
        })
    }
}

// @desc    show password reset page
module.exports.showResetPasswordPage = async (req, res) => {
    try {
        // 'find' method returns an array of all users found
        const user = await User.find({
            resetPasswordToken: req.params.token, 
            resetPasswordExpires: {$gt : Date.now()}
        })
        if(user.length < 1) throw ''

        res.render('account/password/reset', {
            token: req.params.token
        })
    } catch (error) {
        req.flash('error', 'Password reset token is invalid or has expired.')
        res.redirect('/account/password/forgot')
    }
}


// @desc    rest password
module.exports.resetPassword = async (req, res) => {
    try {
        let error = {errors: {}}
        let user = await User.findOne({
            resetPasswordToken: req.params.token, 
            resetPasswordExpires: {$gt : Date.now()}
        })
        console.log(user)
        if(!user) throw ''
        
        const {password, password2} = req.body
        for(let field in req.body) {
            if (req.body[field] === '') {
                error.errors[field] = 'field cannot be empty'
            }
        }
        if(password !== password2) {
            error.errors.password2 = 'passwords do not match'
        }

        if(Object.keys(error.errors).length > 0) throw (error)

        user.password = password
        // remove reset properties from user document (the reset properties are used only for one password resetting)
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined

        error = user.validateSync()
        if (error) throw (error)
        // hashing password is done in the pre-save middleware
        user.save()

        req.flash('success_msg', 'Password reset complete. You may login now.')
        res.redirect('/account/signin')
    } catch (error) {
        res.render('account/password/reset', {
            token: req.params.token,
            ...error
        })
    }
}
