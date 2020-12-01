const LocalStrategy = require('passport-local').Strategy

const User = require('../models/User')

module.exports = (passport) => {
    // assign 'email' as the usernameField
    passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
        // match email
        User.findOne({email: email})
            .then(async user => {
                const msg = 'Incorrect email or password. Try again.'
                if(!user) return done(null, false, {message: msg})
                // match password
                try {
                    const isMatch = await user.comparePassword(password)
                    if (isMatch) return done(null, user)
                    else return done(null, false, {message: msg})
                } catch (err) {
                    throw(err)
                }
            })
            .catch(err => console.log(err))
    }))

    // serialize & deserialize user
    passport.serializeUser((user, done) => done(null, user.id))
      
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user))
    })
}
