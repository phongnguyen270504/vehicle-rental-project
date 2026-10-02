const validateFullname = (fullname) => {
    if (typeof fullname !== 'string' || fullname.trim() === '') {
        return 'Họ và tên là bắt buộc';
    }
    return null;
}

const validateRequireEmail = (email) => {
    if (typeof email !== 'string' || email.trim() === '') {
        return 'Email là bắt buộc';
    }
   
    return null;
}


const validateRegexEmail =(email)=>{
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email=== 'string' && !emailRegex.test(email)) {
        return 'Email không hợp lệ';
    }
    return null;
}

const validateEmail= (email)=>{
    
    let error = validateRequireEmail(email);

    if (error) {
        return error;
    }

    return validateRegexEmail(email);
    
}

const validatePhone = (phone) => {
    if (typeof phone === 'string' && !/^[0-9]{10}$/.test(phone)) {
        return 'Số điện thoại phải có 10 chữ số';
    }
    return null;
}

const validateLenghtPassword= (password,length)=>{
    if(password.length < length)
    {
        return `Mật khẩu phải có ít nhất ${length} ký tự`;
    }
    return null
}

const validateRequirePassword= (password) =>{
    
    if (typeof password !== 'string' || password.trim() === '') 
    {
        return 'Mật khẩu là bắt buộc';
    }
    return null
}

const validatePassword = (password) => {
    let error= validateRequirePassword(password);
    
    if(error)
    {
        return error
    }
    
    return validateLenghtPassword(password,6);
}



const validateConfirmPassword = (password, confirmPassword) => {
    
    let error= validateRequirePassword(password);
    
    if(error)
    {
        return error
    }
    if (password !== confirmPassword) {
        return 'Xác nhận mật khẩu không khớp';
    }
    return null;
}

const validateCreateUser = (userData) => {
    const errors = {};
   
    const role = userData.role?.trim();

    if(userData.fullname !== undefined) {
        const fullnameError = validateFullname(userData.fullname);
        if (fullnameError) {
            errors.fullname = fullnameError;
        }
    }
    if(userData.phone !== undefined) {
        const phoneError = validatePhone(userData.phone);
        if (phoneError) {
            errors.phone = phoneError;
        }
    }
    if(userData.email !== undefined) {
        const emailError = validateEmail(userData.email);
        if (emailError) {
            errors.email = emailError;
        }
    }
    if(userData.password !== undefined) {
        const passwordError = validatePassword(userData.password);
        if (passwordError) {
            errors.password = passwordError;
        }
    }
    if(userData.confirmpassword !== undefined) {
        const confirmPasswordError = validateConfirmPassword(userData.password, userData.confirmpassword);
        if (confirmPasswordError) {
            errors.confirmpassword = confirmPasswordError;
        }
    }
   
   /* if (!role) {
        errors.role = 'Vai trò là bắt buộc';
    }*/
    
    return errors;
}

const validateUpdateUser = (userData) => {
       const errors = {};

    if (userData.fullname !== undefined) {
        const fullnameError = validateFullname(userData.fullname);

        if (fullnameError) {
            errors.fullname = fullnameError;
        }
    }

    if (userData.phone !== undefined) {
        const phoneError = validatePhone(userData.phone);

        if (phoneError) {
            errors.phone = phoneError;
        }
    }

    if (userData.email !== undefined) {
        const emailError = validateEmail(userData.email);

        if (emailError) {
            errors.email = emailError;
        }
    }

    return errors;
}
module.exports = {
    validateCreateUser,
    validateUpdateUser,
    validateRequirePassword,
    validateLenghtPassword,
    validatePassword,
    validateFullname,
    validateConfirmPassword,
    validatePhone,
    validateEmail,
    validateRegexEmail,
    validateRequireEmail
};