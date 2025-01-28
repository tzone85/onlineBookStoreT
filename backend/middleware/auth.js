const basicAuth = require('basic-auth');

const auth = (req, res, next) => {
    const user = basicAuth(req);

    if (!user || user.name !== process.env.ADMIN_USERNAME || user.pass !== process.env.ADMIN_PASSWORD) {
        res.set('WWW-Authenticate', 'Basic realm="Authorization Required"');
        return res.status(401).send('Authentication required.');
    }

    next();
};

module.exports = auth;
