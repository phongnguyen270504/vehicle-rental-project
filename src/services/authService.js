const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const loginUser= async (email, password) => {

    email = email.trim().toLowerCase();
    const user = await User.findOne({ where: { email } });
    if (!user) {
        const err = new Error('Tài khoản hoặc mật khẩu không đúng');
        err.statusCode = 401;
        throw err;
    }
    const isMatch = await bcrypt.compare(password, user.hashpass);
    if (!isMatch) {
        const err = new Error('Tài khoản hoặc mật khẩu không đúng');
        err.statusCode = 401;
        throw err;
    }
    if (user.user_status !== 'active') {
        const err = new Error('Tài khoản của bạn đã bị khóa hoặc không hoạt động');
        err.statusCode = 403;
        throw err;
    }
   
    return user; 
}

const changePassword= async (user_id, currentPassword, newPassword )=>
{
    const user = await User.findByPk(user_id);
    
     if (!user) {
        const err = new Error('Người dùng không tồn tại');
        err.statusCode = 404;
        throw err;
    }

     const isMatch = await bcrypt.compare(
        currentPassword,
        user.hashpass
    );
    if(!isMatch)
    {
        const err = new Error('Mật khẩu hiện tại không đúng');
        err.statusCode = 400;
        throw err;
    }

    if (currentPassword === newPassword) {
        const err = new Error(
            'Mật khẩu mới phải khác mật khẩu hiện tại'
        );
        err.statusCode = 400;
        throw err;
    }

    const hashpass = await bcrypt.hash(newPassword, 10);

     user.hashpass = hashpass;

    await user.save();

    return user;
}

const registerUser = async (email, password, confirmPassword) => {
    
    
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
        const err = new Error('Nguời dùng đã tồn tại');
        err.statusCode = 400;
        throw err;
    }
    
    const hashpass = await bcrypt.hash(password, 10);
    const user = await User.create({
        email,
        hashpass,
        role: 'customer'
    });
    return {
        id: user.id,
        email: user.email,
        role: user.role
    };
}

const generateToken = (user) => {
    return jwt.sign(
        {  id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
}

module.exports = { 
    loginUser , 
    registerUser, 
    generateToken,
    changePassword,
};