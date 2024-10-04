//=================== EXPRESS IMPORTS ==================//
const dotenv = require('dotenv')
dotenv.config();
const express = require('express');
const methodOverride = require('method-override')
const mongoose = require('mongoose')
const session = require('express-session')

const app = express();
const port = process.env.PORT || '3000';


//============= MIDDLEWARE SETUP ================//
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));


//============== SESSION SETUP ==================//
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);


//================== MONGODB CONNECTION =====================//
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {console.log('MongoDB connection successful');
// Start server after MongoDB connection is successful
    app.listen(port, () => {
    console.log(`The express app is ready on port ${port}`);
});
    })
    .catch((err) => console.err('MongoDB connection error:', err));