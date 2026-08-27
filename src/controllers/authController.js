const authService = require('../services/authService');
require('dotenv').config();

const registerUser = async (req, res) => {
    try {
       const {email, password}= req.body;
       if (!email || !password) {
         return res.status(400).json({ message: 'email and password are required' });
       }
       const user= await authService.registerUser(email, password);
       res.status(201).json(user);
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
    }
}

const loginUser = async (req, res) => {
    try {
        const {email, password}= req.body;
        const user= await authService.loginUser(email, password);
        const token= authService.generateToken(user);
        res.json({token});
    } catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({
        message: err.message || 'Server error'
        });
    }
}

module.exports= {
    registerUser, 
    loginUser,
};