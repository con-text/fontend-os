
/**
* Module that checks if user object exists in the session
*/

function isAuthenticated(req, res, next) {

    if (req.session && req.session.user)
        return next();

    res.status(401).send({ error: 'Unauthorized' });
}

module.exports = isAuthenticated;
