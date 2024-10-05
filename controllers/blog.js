const express = require('express');
const router = express.Router();

const User = require('../models/user.js');
const Post = require('../models/post.js');
const Comment = require('../models/comment.js');

//============== ROUTERS ================ //

router.get('/users/:userId/blogs', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user by userId and populate posts
        const user = await User.findById(userId).populate('posts');

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Render to the blogs.ejs page with the user and their posts
        res.render('blog/index.ejs', { user, blogs: user.posts }); // Use user.posts here
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).send('Server error');
    }
});


router.get('/users/:userId/new', async(req, res) => {
    const userId = req.params.userId;
    const user = await User.findById(userId)
    res.render('blog/new.ejs', { user })
})

router.post('/users/:userId/blogs', async(req, res) => {
    router.post('/users/:userId/blogs', async(req, res) => {
        const { title, content } = req.body;
        const userId = req.params.userId;
        const currentTime = new Date();
    
        const newPost = {
            title,
            content,
            createdAt: currentTime,
            updatedAt: currentTime,
            comment: []
        };
    
        const post = await Post.create(newPost); 
        const user = await User.findById(userId);
        user.posts.push(post._id);
        await user.save();
    
        res.redirect(`/users/${userId}/blogs`);
    });
})

router.get('/users/:userId/blogs/:postId', async (req, res) => {
    const userId = req.params.userId;
    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId).populate('comment');
        const user = await User.findById(userId);
        
        res.render('blog/show.ejs', { user, post }); // Render the specific post
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).send('Server error');
    }
});


module.exports = router