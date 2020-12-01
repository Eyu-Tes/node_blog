const express = require('express')
const multer  = require('multer')

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const {ensureAuth} = require('../middleware/auth')

const {
    showSignupUserPage, 
    signupUser, 
    showSigninUserPage, 
    signinUser, 
    signoutUser, 
    showProfilePage, 
    updateUser, 
    deleteUser, 
    showChangeUserPasswordPage, 
    changePassword, 
    showForgotPasswordPage, 
    sendResetEmail, 
    showResetPasswordPage, 
    resetPassword
} = require('../controllers/account')

const router = express.Router()

// @route   /account/signup
router.route('/signup')
.get(showSignupUserPage)              // @method    GET
.post(signupUser)                     // @method    POST

// @route   /account/signin
router.route('/signin')
.get(showSigninUserPage)              // @method    GET
.post(signinUser)                     // @method    POST

// @route   GET /account/signout
router.get('/signout', signoutUser)

// @route   /account
router.route('/')
.get(showProfilePage)                                       // @method    GET
.post(ensureAuth, upload.single('avatar'), updateUser)      // @method    POST

// @route   POST /account/delete 
router.post('/delete', ensureAuth, deleteUser)        

// @route   /account/password/change
router.route('/password/change')
.get(ensureAuth, showChangeUserPasswordPage)                // @method  GET
.post(ensureAuth, changePassword)                           // @method  POST

// @route   /account/password/reset
router.route('/password/forgot')
.get(showForgotPasswordPage)                    // @method  GET
.post(sendResetEmail)                           // @method  POST

// @route   /account/password/reset/:token
router.route('/password/reset/:token')
.get(showResetPasswordPage)                         // @method  GET
.post(resetPassword)                                // @method POST

module.exports = router
