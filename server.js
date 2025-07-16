require('dotenv').config({ quiet: true })
const express = require('express')
const app = express()
const methodOverride = require('method-override')
const morgan = require('morgan')
const mongoose = require('mongoose')
const session = require('express-session')
const mongoStore = require('connect-mongo')
const authController = require('./controllers/authController')
const isSignedIn = require("./middleware/is-signed-in.js");
const passUserToView = require("./middleware/pass-user-to-view.js");

// DATABASE CONNECTION
mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('connected', () => {
    console.log(`Connected to MongoDB ${mongoose.connection.name} 🙃.`)
})

// MIDDLEWARE
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))
app.use(morgan('dev'))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: mongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
    })
}))

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
// Add our custom middleware right after the session middleware
app.use(passUserToView);

app.get('/', (req, res) => {
    res.render('index.ejs', { title: 'my App' })
})

// ROUTES
app.use('/auth', authController)

app.get("/vip-lounge", isSignedIn, (req, res) => {
  res.send(`Welcome to the party ${req.session.user.username}.`);
});

const port = process.env.PORT ? process.env.PORT : "3000"
app.listen(port, () => {
    console.log(`The express app is ready on port ${port}`)
})