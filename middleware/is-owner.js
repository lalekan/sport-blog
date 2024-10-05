const Post = require('../models/post');
const Comment = require('../models/comment');

// Middleware to check if the user is the owner of the post
module.exports.isPostOwner = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        if (post.user.toString() !== req.session.user._id.toString()) {
            return res.status(403).send('You do not have permission to perform this action');
        }
        next();
    } catch (error) {
        console.error('Error checking post owner:', error);
        res.status(500).send('Server error');
    }
};

// Middleware to check if the user is the owner of the comment
module.exports.isCommentOwner = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (comment && comment.commenterId.equals(req.session.user._id)) {
            next();
        } else {
            res.status(403).send('Unauthorized to edit or delete this comment');
        }
    } catch (error) {
        console.error('Error checking comment ownership:', error);
        res.status(500).send('Internal Server Error');
    }
};
