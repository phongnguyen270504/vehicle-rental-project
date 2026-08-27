const userService = require('../services/userService');
const getAllUsers = async (req,res) => {
    try {
         const keyword = req.query.keyword || '';
        const results = await userService.getAllUsers({ ...req.query, keyword });

        res.json(results);
    }
    catch (err) {
         res.status(err.statusCode || 500).json({
            message: err.message || 'Server error'
        });
    }
}
const getUserById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userService.getUserById(userId);
        res.json(user);
    }
    catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message || 'Server error'
        });
    }
}

const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    }
    catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message || 'Server error'
        });
    }
}

const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const updatedUser = await userService.updateUser(userId, req.body);
        res.json(updatedUser);
    }
    catch (err) {
        res.status(err.statusCode || 500).json({
            message: err.message || 'Server error'
        });
    }
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser
}
