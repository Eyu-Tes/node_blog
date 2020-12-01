// middleware that can be added to any route as a parameter
// a route can take any number of middleware functions as a parameter

module.exports = {
    // protect unauthenticated users from accessing certain resources (urls)
    ensureAuth: (req, res, next) => {
        // use passport's isAuthenticated() method
        if(req.isAuthenticated()) {
            return next()
        }
        // is not authenticated redirect unauthenticated user to public home page
        res.redirect('/')
    }
}
