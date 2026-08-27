const { Op } = require('sequelize');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { builtPagination } = require('../utils/pagination');

const getAllUsers = async (options = {}) => {
    const where = {};

    const page = Math.max(Number(options.page) || 1, 1);
    const limit = Math.min(Math.max(Number(options.limit) || 10, 1), 20);
    const offset = (page - 1) * limit;
    const order = options.order === 'asc' ? 'ASC' : 'DESC';
    const keyword = (options.keyword || "").trim();
    
    if (keyword) {
        where[Op.or] = [
            { fullname: { [Op.like]: `%${keyword}%` } },
            { email: { [Op.like]: `%${keyword}%` } },
            { phone: { [Op.like]: `%${keyword}%` } }
        ];
    }
    const role = options.role?.trim().toLowerCase();
    if(role){
            where.role= role;
    }
    const status = options.status?.trim().toLowerCase();
    if(status){
            where.user_status= status;
    }
    const { rows: users, count: total } = await User.findAndCountAll({
        attributes: ['id', 'fullname', 'phone', 'email', 'role', 'user_status'],
        where,
        limit,
        offset,
        distinct: true,
         order: [
        ["created_at", order]
    ],
    });
    const totalPages = Math.ceil(total / limit);
    const pagination = builtPagination(page, totalPages);

    const result = {
        users,
        total,
        limit,
        currentPage: page,
        totalPages,
        pagination,
    }
    return result;
   }
   
const getUserById = async (id) => {
    const user = await User.findByPk(id, {
        attributes: ['id', 'fullname', 'phone', 'email', 'role', 'user_status', 'created_at', 'updated_at'],
    });
    if(!user) {
        const err = new Error('Không tìm thấy người dùng');
        err.statusCode = 404;
        throw err;
    }
    return user;
}

const createUser = async (userData) => {
    const {fullname, phone,email, password, confirmpassword} = userData;
    if(!fullname || !email || !password || !confirmpassword){
        const err = new Error('Thiếu thông tin người dùng');
        err.statusCode = 400;
        throw err;
    }
    const existingUser = await User.findOne({
        where:{[Op.or]:{
            email: userData.email,
            phone: userData.phone
        }}
    });

    if (existingUser && existingUser.id !== userData.id) {
        const err = new Error('Người dùng đã tồn tại');
        err.statusCode = 409;
        throw err;
    }

    if(password !== confirmpassword){
        const err = new Error('Mật khẩu không khớp');
        err.statusCode = 400;
        throw err;
    }

    const hashpass= await bcrypt.hash(password, 10);

    
    const result = await User.create({
        fullname,
        phone,
        email,
        hashpass,
        role: 'customer',
        user_status: 'active'
    });
    const user ={
        id: result.id,
        fullname: result.fullname,
        phone: result.phone,
        email: result.email,
        role: result.role,
        user_status: result.user_status,
        created_at: result.created_at,
        updated_at: result.updated_at
    }
    return user;
}

const updateUser = async (id, userData) => {
    const user = await User.findByPk(id);
    if(!user) {
        const err = new Error('Không tìm thấy người dùng');
        err.statusCode = 404;
        throw err;
    }

    const updateData={};
    if(userData.fullname) {
        updateData.fullname= userData.fullname;
    }
    if(userData.phone) {
        updateData.phone= userData.phone;
    }
    if(userData.email) {
        updateData.email= userData.email;
    }
    
    await user.update(updateData);
    return user;
}

const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) {
    const err = new Error('Không tìm thấy người dùng');
    err.statusCode = 404;
    throw err;
  }
  if (user.user_status === 'inactive') {
    const err = new Error('Người dùng đã bị vô hiệu hóa');
    err.statusCode = 400;
    throw err;
  }
    return changeStatusUser(user, 'inactive');
}

const restoreUser = async (id) => {
    const user = await User.findByPk(id);
    if (!user) {
        const err = new Error('Không tìm thấy người dùng');
        err.statusCode = 404;
        throw err;
    }
    if (user.user_status !== 'inactive') {
        const err = new Error('Người dùng không ở trạng thái bị vô hiệu hóa');
        err.statusCode = 400;
        throw err;
    }
    return changeStatusUser(user, 'active');
}

const changeStatusUser = async (user, status) => {
    user.user_status = status;
    await user.save();
    return user;
}

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    restoreUser,
}
