const isLogin = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    req.session.returnTo= req.originalUrl;
    res.redirect('/auth/login');
    return;
};

const isAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        res.redirect('/auth/login');
        return;
    }
    
     return next();
};

module.exports = { 
    isLogin, 
    isAdmin 
};