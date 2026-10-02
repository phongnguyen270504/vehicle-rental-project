const authService = require('../../services/authService');

const { validatePassword, 
        validateConfirmPassword,
        validateEmail, 
        validateRequirePassword,
    }= require('../../validations/validateUser');
const loginPage= async (req,res)=>{
    try {
        res.render('auth/login.ejs',{
            title: 'Đăng nhập',
            errorMessage: null,
            errors: {},
            data: {},
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const login= async (req,res)=>{
    try {
        const { email, password } = req.body;
        const errors= {};
        
        errors.email= validateEmail(email);
        errors.password= validateRequirePassword(password);
        const hasError = Object.values(errors).some(error => error);
        if(hasError)
        {
            return res.status(400).render('auth/login.ejs',{
            errorMessage: null,
            title: 'Đăng nhập',
            errors,
            data: {...req.body},
        });
        }
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
            errors:{},
            errorMessage: err.message || 'Server error',
            data: {...req.body},
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
            errorMessage: null,
            errors: {},
            data: {}
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const register= async (req,res)=>{
    try {
        const { email, password, confirmPassword } = req.body;
        const errors ={};
        errors.email= validateEmail(email.toLowerCase().trim());
        errors.password= validatePassword(password);
        errors.confirmPassword= validateConfirmPassword(password,confirmPassword);
        
        const hasError= Object.values(errors).some(error => error);
        if(hasError)
        {
            return res.status(400).render('auth/register.ejs',{
            errorMessage: null,
            title: 'Đăng ký',
            errors,
            data: {...req.body},
            });
        }

        const user = await authService.registerUser(email, password, confirmPassword);
        req.session.user = {
            id: user.id,
            email: user.email,
            role: user.role
        };
        res.redirect('/cars');
    } catch (err) {
        console.log(err);
        
        res.status(err.statusCode || 500).render('auth/register.ejs',{
            title: 'Đăng ký',
            errorMessage: err.message || 'Server error',
            errors:{},
            data: {...req.body},
        });
    }
}

const changePasswordPage= async (req, res) => {
    res.render('auth/change-password', {
        title: 'Đổi mật khẩu',
        successMessage: null,
        errorMessage: null,
        errors: {},
    });
    
}
const changePassword= async (req, res) => {
    try {
         const userId = req.session.user.id;

    const {
            currentPassword,
            newPassword,
            confirmPassword
        } = req.body;
         const errors = {
            currentPassword: validatePassword(currentPassword),
            newPassword: validatePassword(newPassword),
            confirmPassword: validateConfirmPassword(
                newPassword,
                confirmPassword
            )
        };

        const hasError=Object.values(errors).some(error => error);

        if(hasError)
        {
            return res.render('auth/change-password', {
                title: 'Đổi mật khẩu',
                successMessage: null,
                errorMessage: 'Đổi mật khẩu thất bại',
                errors,
                currentPassword,
                newPassword,
                confirmPassword
            });
        }

    await authService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({message: 'Đổi mật khẩu thành công'});

    } catch (err) {
         res.status(err.statusCode || 500).render('auth/change-password', {
                title: 'Đổi mật khẩu',
                successMessage: null,
                errorMessage: err.message,
                errors: {},
        });
    }
    
}

module.exports={
    loginPage, 
    login, 
    logout, 
    registerPage, 
    register,
    changePassword,
    changePasswordPage,
};