module.exports = (req, res, next) => {
    if (req.session.user) {
        next(); // User is signed in, proceed to the next middleware
    } else {
        res.redirect('/auth/sign-in'); // Redirect to sign-in if not signed in
    }
};
