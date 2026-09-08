const validateFullname = (fullname) => {
    if (!fullname || fullname.trim() === '') {
        return 'Họ và tên là bắt buộc';
    }
    return null;
}

const validateEmail = (email) => {
    if (!email || email.trim() === '') {
        return 'Email là bắt buộc';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Email không hợp lệ';
    }
    return null;
}

const validatePhone = (phone) => {
    if (phone && !/^[0-9]{10}$/.test(phone)) {
        return 'Số điện thoại phải có 10 chữ số';
    }
    return null;
}

const validatePassword = (password) => {
    if (!password || password.trim() === '') {
        return 'Mật khẩu là bắt buộc';
    }
    if (password.length < 6) {
        return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    return null;
}

const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword || confirmPassword.trim() === '') {
        return 'Xác nhận mật khẩu là bắt buộc';
    }
    if (password !== confirmPassword) {
        return 'Xác nhận mật khẩu không khớp';
    }
    return null;
}

const validateCreateUser = (userData) => {
    const errors = {};
    
    const fullnameError = validateFullname(userData.fullname);
    const phoneError = validatePhone(userData.phone);
    const emailError = validateEmail(userData.email);
    const passwordError = validatePassword(userData.password);
    const confirmPasswordError = validateConfirmPassword(userData.password, userData.confirmpassword);
    const role = userData.role?.trim();

    if (fullnameError) {
        errors.fullname = fullnameError;
    }
    if (emailError) {
        errors.email = emailError;
    }
    if (phoneError) {
        errors.phone = phoneError;
    }
    if (passwordError) {
        errors.password = passwordError;
    }
    if (confirmPasswordError) {
        errors.confirmpassword = confirmPasswordError;
    }

   
   /* if (!role) {
        errors.role = 'Vai trò là bắt buộc';
    }*/
    
    return errors;
}

const validateUpdateUser = (userData) => {
    const errors = {};

    const fullnameError = validateFullname(userData.fullname);
    const phoneError = validatePhone(userData.phone);
    const emailError = validateEmail(userData.email);
    const role = userData.role?.trim();

    if (fullnameError) {
        errors.fullname = fullnameError;
    }
    if (emailError) {
        errors.email = emailError;
    }
    if (phoneError) {
        errors.phone = phoneError;
    }
   /* if (role) {
        errors.role = 'Vai trò là bắt buộc';
    }*/

    return errors;
}
module.exports = {
    validateCreateUser,
    validateUpdateUser
};