const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')

const connectDB = require('./config/db')

/* ===== This needs to loaded before other configurations ===== */
// load environment varibles from .env file into process.env
dotenv.config({path: './config/config.env'})

// load DB connection
connectDB()

// initialize app
const app = express()

// use HTTP request logger middleware if server is running in development mode
process.env.NODE_ENV === 'development' && app.use(morgan('dev'))

// handlebars helpers
const {urlsEqual} = require('./controllers/helpers/hbs')

// register handlebars as view engine (.hbs extension)
app.engine('.hbs', exphbs({
    helpers: {
        urlsEqual
    },
    extname: '.hbs'
}))
app.set('view engine', '.hbs')

// global variables (variables used inside templates)
app.use((req, res, next) => {
    res.locals.path = req.url
    res.locals.user = req.user 
    next()
})

// load router
app.use('/', require('./routes/index'))

// set static folder
app.use(express.static(path.join(__dirname, 'public')))

const PORT = process.env.PORT || 5000

app.listen(PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT} ...`))
