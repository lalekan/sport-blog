const passUserToView = (req, res, next) => {

    if (req.session && req.session.user) {
        res.local.user = req.session.user;
    } else {
        res.locals.user = null;
    }
    next()
}
module.exports = passUserToView