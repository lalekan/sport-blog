const express = require('express');
const router = express.Router();
const Post = require('../models/post.js');
const Comment = require('../models/comment.js');

// Add a new comment
router.post('/users/:userId/blogs/:postId/comments', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/sign-in'); // Redirect to sign-in if not authenticated
    }

    console.log(req.session, "REQ.SESSION TO ADD COMMENT!!!")

    const { content } = req.body;
    const userId = req.session.user._id; // Use req.session.user
    const postId = req.params.postId;
    const currentTime = new Date();

    const newComment = new Comment({
        postId,
        commenterId: userId,
        content,
        createdAt: currentTime,
        updatedAt: currentTime,
    });

    await newComment.save();
    
    // Add comment to the post's comments array
    const post = await Post.findById(postId);
    post.comment.push(newComment._id);
    await post.save();

    res.redirect(`/users/${userId}/blogs/${postId}`); // Redirect back to the blog
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

    console.log(req.session, "REQ.SESSION TO DELETE COMMENT!!!")


    const commentId = req.params.commentId;
    const postId = req.query.postId;

    await Comment.findByIdAndDelete(commentId);

    // Remove comment ID from the post's comments array
    const post = await Post.findById(postId);
    post.comment.pull(commentId);
    await post.save();

    res.redirect(`/users/${req.session.user._id}/blogs/${postId}`); // Redirect back to the blog
});



module.exports = router;
