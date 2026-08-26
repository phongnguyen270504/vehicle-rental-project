const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const loginUser= async (email, password) => {
   if(typeof email !== 'string' || !email.trim()){
        const err = new Error('Email không được để trống');
        err.statusCode = 400;
        throw err;
    }
    if(typeof password !== 'string' || !password.trim()){
        const err = new Error('Mật khẩu không được để trống');
        err.statusCode = 400;
        throw err;
    }

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
    if (user.user_status === 'inactive') {
        const err = new Error('Tài khoản của bạn đã bị khóa hoặc không hoạt động');
        err.statusCode = 403;
        throw err;
    }
   
    return user; 
}

const registerUser = async (email, password, confirmPassword) => {
    
    if(typeof email !== 'string' || !email.trim()){
        const err = new Error('Email không được để trống');
        err.statusCode = 400;
        throw err;
    }

    email = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        const err = new Error('Email không hợp lệ');
        err.statusCode = 400;
        throw err;
    }
    if(typeof password !== 'string' || !password.trim()){
        const err = new Error('Mật khẩu không được để trống');
        err.statusCode = 400;
        throw err;
    }
    
    if(typeof confirmPassword !== 'string' || !confirmPassword.trim()){
        const err = new Error('Xác nhận mật khẩu không được để trống');
        err.statusCode = 400;
        throw err;
    }
    if (password !== confirmPassword) {
        const err = new Error('Mật khẩu xác nhận không khớp');
        err.statusCode = 400;
        throw err;
    }
    if(password.length < 8){
        const err = new Error('Mật khẩu phải có ít nhất 8 ký tự');
        err.statusCode = 400;
        throw err;
    }
    if(password.length > 100){
        const err = new Error('Mật khẩu không được quá 100 ký tự');
        err.statusCode = 400;
        throw err;
    }
    
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

module.exports = { loginUser , registerUser, generateToken};