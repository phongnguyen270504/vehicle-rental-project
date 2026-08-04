const userService = require('../../../services/userService');

const UserDetailPage = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userService.getUserById(userId);
        res.render('admin/user-detail.ejs', {
            title: 'Chi tiết người dùng',
            user
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

module.exports = {UserDetailPage, manageUsersPage};