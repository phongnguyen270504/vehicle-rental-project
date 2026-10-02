const userService = require('../../../services/userService');
const {formatDate} = require('../../../utils/date');
const { validateCreateUser, validateUpdateUser } = require('../../../validations/validateUser');
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

const adminDetailPage =async (req, res)=>{
     try {
        const userId = req.session.user.id;
        const userDetails = await userService.getUserById(userId);
        res.render('admin/user-detail.ejs', {
            title: 'Thông tin của tôi',
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
        res.render('admin/create-user.ejs', {
            title: 'Tạo người dùng mới',
            errorMessage: null,
            errors: {},
            userData: {}
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const createUser= async (req, res) =>{
    const userData = req.body;
    const errors = validateCreateUser(userData);
    const hasError= Object.values(errors).some(error=>error);
    if (hasError) {
        return res.status(400).render('admin/create-user.ejs', {
            title: 'Tạo người dùng mới',
            errorMessage: 'Dữ liệu không hợp lệ',
            errors: errors,
            userData: req.body
        });
    }
    try {
        await userService.createUser(req.body);
        return res.redirect('/admin/users')
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).render('users/create-user.ejs', {
            title: 'Tạo người dùng mới',
            errorMessage: err.message || 'Server error',
            errors: err.errors || {},
            userData: userData
        });
    }
}

const updateUserPage = async (req, res) =>{
    try{
        const userId = req.params.id;
        const user = await userService.getUserById(userId);
        res.render('admin/update-user.ejs', {
            title: 'Cập nhật thông tin người dùng',
            editUser: user,
            errorMessage: null,
            errors: {}
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
        const errors= validateUpdateUser({...req.body});
        const hasError= Object.values(errors).some(error=>error)
        if(hasError)
        {
            return res.status(400).render('admin/update-user.ejs', {
            title: 'Cập nhật thông tin người dùng',
            errorMessage: 'Dữ liệu không hợp lệ',
            errors: errors,
            editUser: { ...req.body, id: req.params.id }
        });
        }
        await userService.updateUser(userId, req.body);
        
        return res.redirect(`/admin/users/${userId}/edit`);
    }
    catch (err) {
        console.error(err);
        return res.status(err.statusCode || 500).render('users/update-user.ejs', {
            title: 'Cập nhật thông tin người dùng',
            errorMessage: err.message || 'Server error',
            errors: err.errors || {},
            editUser: { ...req.body, id: req.params.id }
        });
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

const restoreUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await userService.restoreUser(userId);
        res.redirect('/admin/users');
    }
    catch (err) {
        console.error(err);
        res.status(err.statusCode || 500).json({ message: err.message || 'Server error' });
    }
}

module.exports = {
    UserDetailPage, 
    manageUsersPage, 
    createUserPage, 
    createUser, 
    updateUserPage, 
    updateUser, 
    deleteUser,
    restoreUser,
    adminDetailPage,
};