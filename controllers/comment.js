const express = require('express');
const router = express.Router();
const Post = require('../models/post.js');
const Comment = require('../models/comment.js');

router.post('/comments', async (req, res) => {
    const { postId } = req.query;
    const commentData = {
        content: req.body.content,
        commenterId: req.session.user._id,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    try {
        const newComment = await Comment.create(commentData);
        
        await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });

        res.redirect(`/users/${req.session.user._id}/blogs/${postId}`);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/comments/:commentId', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/sign-in'); 
    }


    const { updatedContent } = req.body
    const commentId = req.params.commentId
    const postId = req.query.postId

    await Comment.findByIdAndUpdate(commentId, {
        content: updatedContent,
        updatedAt: new Date()
    });

    res.redirect(`/users/${req.session.user._id}/blogs/${postId}`)
});

router.delete('/comments/:commentId', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/sign-in')
    }

    const commentId = req.params.commentId
    const postId = req.query.postId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        return res.status(404).send('Comment not found')
    }

    await Comment.findByIdAndDelete(commentId)

    const post = await Post.findById(postId);
    post.comments.pull(commentId);
    await post.save();

    res.redirect(`/users/${req.session.user._id}/blogs/${postId}`)
});




module.exports = router;
