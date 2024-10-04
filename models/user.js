const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
   username: {
    type: String,
    required: true,
   },
   password: {
    type: String,
    required: true,
   },
   email: {
    type: String,
    required: true,
   },
   posts: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'postSchema',
    required: true,
   }
});

const User = mongoose.model('Food', userSchema)
module.exports = User
