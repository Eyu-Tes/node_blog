
// @desc    show home page
module.exports.showHomePage = (req, res) => {
    res.render('index')
}

// @desc    show about page
module.exports.showAboutPage = (req, res) => {
    res.render('pages/about')
}

// @desc    show contact page
module.exports.showContactPage = (req, res) => {
    res.render('pages/contact')
}
