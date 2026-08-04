const userService = require('../../services/userService');

const UserDetailPage = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await userService.getUserById(userId);
        res.render('users/user-detail.ejs', {
            title: 'Chi tiết người dùng',
            user
        });
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
    }
}

module.exports = {UserDetailPage};