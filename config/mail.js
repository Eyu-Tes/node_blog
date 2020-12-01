// nodemailer configuration
const nodemailer = require('nodemailer')

// create transporter object
module.exports.transporter = nodemailer.createTransport({
    /* --- mailhog --- (open browser: localhost:8025/) */
    // host: '127.0.0.1',
    // port: '1025',
    /* ----------------------------------------------- */
    /* --- gmail --- */
    service: "gmail",
    /* ------------- */
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }, 
    tls: {
        // Removes - Error: self signed certificate in certificate chain
        rejectUnauthorized: false
    }
})
