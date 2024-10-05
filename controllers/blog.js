const express = require('express');
const router = express.Router();

const User = require('../models/user.js');
const Post = require('../models/post.js');
const Comment = require('../models/comment.js');
const isSignedIn = require('../middleware/is-signed-in');

//============== ROUTERS ================ //

// router.get('/users/:userId/blogs', async (req, res) => {
//     try {
//         const blogs = await Post.find({ user: req.params.userId }).populate('comments');
//         res.render('blog/index.ejs', {
//             blogs,
//             user: req.session.user // Make sure user is passed here
//         });
//     } catch (err) {
//         console.error("Error fetching blogs:", err);
//         res.status(500).send("Error fetching blogs.");
//     }
// });

router.get('/users/:userId/blogs', isSignedIn, async (req, res) => {
    try {
        const blogs = await Post.find({ user: req.params.userId }).populate('comments');
        res.render('blog/index.ejs', {
            blogs,
            user: req.session.user // Ensure user session is passed to the view
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).send('Error fetching blogs.');
    }
});



router.get('/users/:userId/blogs/:postId', async (req, res) => {
    try {
        const { userId, postId } = req.params;

        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Find the specific post by postId and populate comments
        const post = await Post.findById(postId).populate('comments').exec();
        if (!post) {
            return res.status(404).send('Post not found');
        }

        // Render the specific blog post view with user and post details
        res.render('blog/show.ejs', { user, post });
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).send('Server error');
    }
});



router.get('/users/:userId/new', async(req, res) => {
    const userId = req.params.userId;
    const user = await User.findById(userId)
    res.render('blog/new.ejs', { user })
})

// router.post('/users/:userId/blogs', isSignedIn, async (req, res) => {
//     try {
//         const userId = req.params.userId;
//         const { title, content } = req.body;

//         console.log('Creating blog with title:', title, 'and content:', content);
//         console.log('For user:', userId);

//         const newBlog = new Post({
//             title,
//             content,
//             user: userId,
//             createdAt: new Date(),
//             updatedAt: new Date(),
//         });

//         await newBlog.save();
//         console.log('Blog post saved successfully');

//         res.redirect(`/users/${userId}/blogs`);
//     } catch (error) {
//         console.error('Error creating blog post:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

router.post('/users/:userId/blogs', isSignedIn, async (req, res) => {
    try {
        const userId = req.params.userId;
        const { title, content } = req.body;

        // Create a new blog post
        const newBlog = new Post({
            title,
            content,
            user: userId, // Associate blog with current user
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const savedBlog = await newBlog.save();
        console.log('New blog created:', savedBlog);

        // Optionally, update the user's posts array
        const user = await User.findById(userId);
        if (user) {
            user.posts = [...user.posts, savedBlog._id]
            console.log('Updated user posts:', user.posts)
            await user.save();
        }

        res.redirect(`/users/${userId}/blogs`);
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).send('Error creating blog.');
    }
});







module.exports = router