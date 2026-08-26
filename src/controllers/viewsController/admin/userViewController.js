const userService = require('../../../services/userService');
const {formatDate} = require('../../../utils/date');
const UserDetailPage = async (req, res) => {
    try {
        const userId = req.params.id;
        const userDetails = await userService.getUserById(userId);
        res.render('admin/user-detail.ejs', {
            title: 'Chi tiết người dùng',
            userDetails,
            formatDate
        });
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
    }
}

const manageUsersPage = async (req, res) => {
    try {
        const keyword = req.query.keyword || '';
        const results = await userService.getAllUsers({ ...req.query, keyword });
        
        res.render('admin/manage-users.ejs', {
            title: 'Quản lý người dùng',
            users: results.users,
            totalItems: results.total,
            limit: results.limit,
            currentPage: results.currentPage,
            totalPages: results.totalPages,
            pagination: results.pagination,
            query: req.query,
            keyword,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}
const createUserPage = async (req, res) => {
    try {
        res.render('users/create-user.ejs', {
            title: 'Tạo người dùng mới',
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const createUser= async (req, res) =>{
    try {
        const user = await userService.createUser(req.body);
        res.redirect('/admin/users')
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
    }
}

const updateUserPage = async (req, res) =>{
    try{
        const userId = req.params.id;
        const user = await userService.getUserById(userId);
        res.render('users/update-user.ejs', {
            title: 'Cập nhật thông tin người dùng',
            editUser: user
        });
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
    }
}

const updateUser = async (req, res) =>{
    try{
        const userId = req.params.id;
        const updatedUser = await userService.updateUser(userId, req.body);
        
        res.redirect(`/admin/users/${userId}/edit`);
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
    }
}

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await userService.deleteUser(userId);
        res.redirect('/admin/users');
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
    }
}

module.exports = {UserDetailPage, manageUsersPage, createUserPage, createUser, updateUserPage, updateUser, deleteUser};