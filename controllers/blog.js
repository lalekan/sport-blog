const express = require('express');
const router = express.Router();

const User = require('../models/user.js');
const Post = require('../models/post.js');
const Comment = require('../models/comment.js');
const isSignedIn = require('../middleware/is-signed-in');
const { isPostOwner, isCommentOwner } = require('../middleware/is-owner');

//============== ROUTERS ================ //

router.get('/', async (req, res) => {
    try {
        const blogs = await Post.find().populate('user');
        const user = req.session.user || null;
        res.render('landing.ejs', { blogs, user });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).send('Error fetching blogs.');
    }
});

router.get('/users/:userId/blogs', isSignedIn, async (req, res) => {
    try {
        const blogs = await Post.find({ user: req.params.userId }).populate('comments');
        const successMessage = req.query.message; 
        res.render('blog/index.ejs', {
            blogs,
            user: req.session.user,
            successMessage
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).send('Error fetching blogs.');
    }
});

router.get('/users/:userId/blogs/:postId', async (req, res) => {
    try {
        const { userId, postId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        const post = await Post.findById(postId)
            .populate({
                path: 'comments',
                populate: {
                    path: 'commenterId',
                    select: 'username'
                }
            })
            .populate('user', 'username');

        if (!post) {
            return res.status(404).send('Post not found');
        }

        res.render('blog/show.ejs', { user, post, comments: post.comments || [] });
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).send('Server error');
    }
});

router.get('/users/:userId/new', isSignedIn, async (req, res) => {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    res.render('blog/new.ejs', { user });
});

router.post('/users/:userId/blogs', isSignedIn, async (req, res) => {
    try {
        const userId = req.params.userId;
        const { title, content } = req.body;

        const newBlog = new Post({
            title,
            content,
            user: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const savedBlog = await newBlog.save();

        const user = await User.findById(userId);
        if (user) {
            user.posts.push(savedBlog._id);
            await user.save();
        }

        res.redirect(`/users/${userId}/blogs`);
    } catch (error) {
        res.status(500).send('Error creating blog.');
    }
});

router.post('/posts/:postId/comments', isSignedIn, async (req, res) => {
    try {
        const postId = req.params.postId;
        const commenterId = req.session.user._id;
        const { content } = req.body;

        const newComment = new Comment({
            postId,
            commenterId,
            content,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const savedComment = await newComment.save();

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

router.get('/posts/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate({
                path: 'comments',
                populate: {
                    path: 'commenterId',
                    select: 'username'
                }
            })
            .populate('user', 'username');

        if (!post) {
            return res.status(404).send('Post not found');
        }

        res.render('blog/show.ejs', { 
            post, 
            comments: post.comments || [], 
            user: req.session.user || null 
        });
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).send('Error fetching blog post.');
    }
});

router.get('/posts/:postId/edit', isSignedIn, isPostOwner, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        const blogs = await Post.find({ user: req.session.user._id }); 

        res.render('blog/edit.ejs', { post, blogs, user: req.session.user }); 
    } catch (error) {
        console.error('Error displaying edit form:', error);
        res.status(500).send('Error displaying edit form.');
    }
});


router.put('/posts/:postId', isSignedIn, isPostOwner, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.postId, req.body, { new: true });
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.redirect(`/posts/${post._id}`);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).send('Error updating post.');
    }
});

router.delete('/posts/:postId', isSignedIn, isPostOwner, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.postId);
        res.redirect(`/users/${req.session.user._id}/blogs?message=Post Deleted`);
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send('Error deleting post.');
    }
});

router.get('/posts/:postId/comments/:commentId/edit', isSignedIn, isCommentOwner, async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).send('Comment not found');
        }
        res.render('comments/edit.ejs', { comment, postId });
    } catch (error) {
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

router.delete('/posts/:postId/comments/:commentId', isSignedIn, isCommentOwner, async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.commentId);
        res.redirect(`/posts/${req.params.postId}`);
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).send('Error deleting comment.');
    }
});

router.get('/blogs/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate({
                path: 'comments',
                populate: {
                    path: 'commenterId',
                    select: 'username'
                }
            });

        if (!post) {
            return res.status(404).send('Blog not found');
        }

        const comments = post.comments || []; 
        res.render('blog/show', { post, comments, user: req.session.user || null }); 
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.redirect('/'); 
    }
});

module.exports = router;
