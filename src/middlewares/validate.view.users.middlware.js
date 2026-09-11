
const validateUser = require("../validations/validateUser");
const validateUpdateUser = (req, res, next) => {
    const errors = validateUser.validateUpdateUser(req.body);
    if (Object.keys(errors).length > 0) {
     return res.status(400).render('users/update-user.ejs', {
            title: 'Cập nhật thông tin người dùng',
            errorMessage: 'Dữ liệu không hợp lệ',
            errors: errors,
            editUser: { ...req.body, id: req.params.id }
        });
    }
    next();
}

module.exports = {
    validateUpdateUser,
};