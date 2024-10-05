const express = require('express')
const router = express.Router();
const bcrypt = require('bcrypt')

const User = require('../models/user.js');
const Post = require('../models/post.js');
const Comment = require('../models/comment.js');

router.get('/sign-up', (req, res) => {
  res.render('auth/sign-up.ejs');
});
router.get('/sign-in', (req, res) => {
    res.render('auth/sign-in.ejs');
  });

router.post('/sign-in', async (req, res) => {
    try {
      const userInDatabase = await User.findOne({ username: req.body.username });
      if (!userInDatabase) {
        return res.send('Login failed. Please try again.');
      }
        const validPassword = bcrypt.compareSync(
        req.body.password,
        userInDatabase.password
      );
      if (!validPassword) {
        return res.send('Login failed. Please try again.');
      }
        req.session.user = {
        username: userInDatabase.username,
        _id: userInDatabase._id,
      };
  
      res.redirect('/');
    } catch (error) {
      console.log(error);
      res.redirect('/');
    }
  });
  

router.get('/sign-out', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

router.post('/sign-up', async (req, res) => {
    try {
       console.log('Password:', req.body.password);
       console.log('Confirm Password:', req.body.confirmPassword);
 
       const userInDatabase = await User.findOne({ username: req.body.username });
       if (userInDatabase) {
          return res.status(400).send('Username already taken.');
       }
 
       if (req.body.password !== req.body.confirmPassword) {
          console.log('Passwords do not match');
          return res.status(400).send('Password and Confirm Password must match.');
       }
 
       const hashedPassword = bcrypt.hashSync(req.body.password, 10);
       req.body.password = hashedPassword;
 
       await User.create(req.body);
       res.redirect('/auth/sign-in');
    } catch (error) {
       console.error('Error creating user:', error);
       res.status(500).redirect('/');
    }
 });
 

router.post('/sign-in', async (req, res) => {
  try {
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (!userInDatabase) {
      return res.send('Login failed. Please try again.');
    }
  
    const validPassword = bcrypt.compareSync(
      req.body.password,
      userInDatabase.password
    );
    if (!validPassword) {
      return res.send('Login failed. Please try again.');
    }
  
    req.session.user = {
      username: userInDatabase.username,
      _id: userInDatabase._id
    };
  
    res.redirect('/');
  } catch (error) {
    res.redirect('/');
  }
});




module.exports = router;