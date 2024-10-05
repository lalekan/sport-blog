const express = require('express');
const router = express.Router();
const Post = require('../models/post.js');
const Comment = require('../models/comment.js');

// Add a new comment
router.post('/comments', async (req, res) => {
    const { postId } = req.query; // Get the postId from the query
    const commentData = {
        content: req.body.content,
        commenterId: req.session.user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    try {
        // Create and save the comment
        const newComment = await Comment.create(commentData);
        
        // Update the corresponding post to include the new comment
        await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });

        res.redirect(`/users/${req.session.user._id}/blogs/${postId}`);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Update a comment
router.post('/comments/:commentId', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/sign-in'); // Redirect to sign-in if not authenticated
    }
    console.log(req.session, "REQ.SESSION TO UPDATE COMMENT!!!")


    const { updatedContent } = req.body;
    const commentId = req.params.commentId;
    const postId = req.query.postId;

    await Comment.findByIdAndUpdate(commentId, {
        content: updatedContent,
        updatedAt: new Date()
    });

    res.redirect(`/users/${req.session.user._id}/blogs/${postId}`); // Redirect back to the blog
});

// Delete a comment
router.delete('/comments/:commentId', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/sign-in'); // Redirect to sign-in if not authenticated
    }

    const commentId = req.params.commentId;
    const postId = req.query.postId;

    // Check if the comment exists
    const comment = await Comment.findById(commentId);
    if (!comment) {
        return res.status(404).send('Comment not found'); // Handle not found comment
    }

    await Comment.findByIdAndDelete(commentId);

    // Remove comment ID from the post's comments array
    const post = await Post.findById(postId);
    post.comment.pull(commentId);
    await post.save();

    res.redirect(`/users/${req.session.user._id}/blogs/${postId}`); // Redirect back to the blog
});




module.exports = router;
