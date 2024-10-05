const express = require('express');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const dotenv = require('dotenv');
const path = require('path'); // Import path module

dotenv.config();

const passUserToView = require('./middleware/pass-user-to-view.js');
const authController = require('./controllers/auth.js');
const blogsController = require('./controllers/blog.js');

const app = express();
const port = process.env.PORT || '3000';

app.use('/styles', express.static('styles'));

//============= MIDDLEWARE SETUP ================//
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(passUserToView)

//============== SESSION SETUP ==================//
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

//=========== ROUTE DEFINITION ==============//
app.use('/auth', authController);  // Use auth routes
app.use(blogsController);

app.get('/', async(req, res) => {
    res.render('landing.ejs', {
        user: req.session.user,
    });
});

//================== MONGODB CONNECTION =====================//
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB connection successful');
        // Start server after MongoDB connection is successful
        app.listen(port, () => {
            console.log(`The express app is ready on port ${port}`);
        });
    })
    .catch((err) => console.error('MongoDB connection error:', err));
