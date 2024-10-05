const express = require('express');
const router = express.Router();

const User = require('../models/user.js');
const Post = require('../models/post.js');
const Comment = require('../models/comment.js');
const isSignedIn = require('../middleware/is-signed-in');
const { isPostOwner, isCommentOwner } = require('../middleware/is-owner');

//============== ROUTERS ================ //

// Display all blogs for a user
router.get('/users/:userId/blogs', isSignedIn, async (req, res) => {
    try {
        const blogs = await Post.find({ user: req.params.userId }).populate('comments');
        res.render('blog/index.ejs', {
            blogs,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).send('Error fetching blogs.');
    }
});

// Display a single blog post with comments
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

// Display form to create a new blog
router.get('/users/:userId/new', isSignedIn, async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    res.render('blog/new.ejs', { user });
});

// Handle new blog creation
router.post('/users/:userId/blogs', isSignedIn, async (req, res) => {
    try {
        const userId = req.params.userId;
        const { title, content } = req.body;

        // Create a new blog post
        const newBlog = new Post({
            title,
            content,
            user: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const savedBlog = await newBlog.save();
        console.log('New blog created:', savedBlog);

        // Update the user's posts array
        const user = await User.findById(userId);
        if (user) {
            user.posts.push(savedBlog._id);
            console.log('Updated user posts:', user.posts);
            await user.save();
        }

        res.redirect(`/users/${userId}/blogs`);
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).send('Error creating blog.');
    }
});

// Handle new comment creation
router.post('/posts/:postId/comments', isSignedIn, async (req, res) => {
    try {
        const postId = req.params.postId;
        const commenterId = req.session.user._id;
        const { content } = req.body;

        // Create the comment
        const newComment = new Comment({
            postId,
            commenterId,
            content,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const savedComment = await newComment.save();

        // Find the post and add the comment to it
        const post = await Post.findById(postId);
        if (post) {
            post.comments.push(savedComment._id);
            await post.save();
        }

        res.redirect(`/posts/${postId}`);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).send('Error adding comment.');
    }
});

// Display a single blog post
router.get('/posts/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate({
                path: 'comments',
                populate: {
                    path: 'commenterId',
                    select: 'username'
                }
            });

        res.render('blog/show.ejs', { post, user: req.session.user });
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).send('Error fetching blog post.');
    }
});

// Display edit form for a blog post
router.get('/posts/:postId/edit', isSignedIn, isPostOwner, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        const blogs = await Post.find({ user: req.session.user._id }); 
        res.render('blog/edit.ejs', { post, blogs, user: req.session.user }); 
    } catch (error) {
        res.status(500).send('Error displaying edit form.');
    }
});


// Handle blog post update
router.put('/posts/:postId', isSignedIn, isPostOwner, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.postId, req.body, { new: true });
        res.redirect(`/posts/${post._id}`);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).send('Error updating post.');
    }
});

router.delete('/posts/:postId', isSignedIn, isPostOwner, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.postId);
        res.redirect('/blogs');
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send('Error deleting post.');
    }
});

router.get('/posts/:postId/comments/:commentId/edit', isSignedIn, isCommentOwner, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        res.render('comments/edit.ejs', { comment, postId: req.params.postId });
    } catch (error) {
        console.error('Error displaying edit form:', error);
        res.status(500).send('Error displaying edit form.');
    }
});

router.put('/posts/:postId/comments/:commentId', isSignedIn, isCommentOwner, async (req, res) => {
    try {
        await Comment.findByIdAndUpdate(req.params.commentId, req.body, { new: true });
        res.redirect(`/posts/${req.params.postId}`);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).send('Error updating comment.');
    }
});

// Handle comment deletion
router.delete('/posts/:postId/comments/:commentId', isSignedIn, isCommentOwner, async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.commentId);
        res.redirect(`/posts/${req.params.postId}`);
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).send('Error deleting comment.');
    }
});

module.exports = router;
