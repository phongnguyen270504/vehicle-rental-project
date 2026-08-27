const authService = require('../../services/authService');

const loginPage= async (req,res)=>{
    try {
        res.render('auth/login.ejs',{
            title: 'Đăng nhập',
            error: null,
            email: null,
            password: null,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const login= async (req,res)=>{
    try {
        const { email, password } = req.body;
        const user = await authService.loginUser(email, password);
        req.session.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        const returnTo= req.session.returnTo || '/';
        
        delete req.session.returnTo;
        
        res.redirect(returnTo);
    } catch (err) {
        console.error(err);
        res.render('auth/login.ejs',{
            title: 'Đăng nhập',
            error: err.message || 'Server error',
            email: req.body.email,
            password: req.body.password
        });
    }
}

const logout= async (req,res)=>{
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Server error' });
            }
            res.redirect('/cars');
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const registerPage= async (req,res)=>{
    try {
        res.render('auth/register.ejs',{
            title: 'Đăng ký',
            error: null,
            email: null,
            password: null,
            confirmPassword: null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const register= async (req,res)=>{
    try {
        const { email, password, confirmPassword } = req.body;
        const user = await authService.registerUser(email, password, confirmPassword);
        req.session.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        res.redirect('/cars');
    } catch (err) {
        console.error(err);
        res.render('auth/register.ejs',{
            title: 'Đăng ký',
            error: err.message || 'Server error',
            email: req.body.email,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword
        });
    }
}

module.exports={
    loginPage, 
    login, 
    logout, 
    registerPage, 
    register,
};