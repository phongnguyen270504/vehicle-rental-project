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
const getAllCustomerForRental= async (options={})=>{
    return await User.findAll({
        where:{
            role:'customer',
            user_status:'active'
        },
        attributes: ['id', 'fullname', 'phone', 'email'],
        order: [['fullname', 'ASC']]
    })
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

    const fullname= userData.fullname?.trim();
    const phone= userData.phone?.trim() || null;
    const email= userData.email?.trim();
    const password= userData.password;
    
    const conditions =[];
    conditions.push({ email });
    if(phone){
        conditions.push({ phone });
    }
    const existingUser = await User.findOne({
        where:{[Op.or]: conditions}
    });

    if (existingUser) {
        const err = new Error('Người dùng đã tồn tại');
        err.statusCode = 409;
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
    const user = await User.findOne({
        where: {
            id,
        },
    });

    if(!user) {
        const err = new Error('Không tìm thấy người dùng');
        err.statusCode = 404;
        throw err;
    }


    
    const fullname = userData.fullname?.trim();
    const phone = userData.phone?.trim() || null;
    const email = userData.email?.trim();
    
        const conditions = [];
    if(userData.email !== undefined) {
        conditions.push({ email });
    }

    if(userData.phone !== undefined) {
        if(phone) {
            conditions.push({ phone });
        }
    }

        let duplicateUser = null;

        if (conditions.length > 0) {
            duplicateUser = await User.findOne({
                where: {
                    [Op.or]: conditions,
                    id: {
                        [Op.ne]: id
                    }
                }
            });
        }
        if (duplicateUser) {
            const err = new Error('Người dùng đã tồn tại');
            err.statusCode = 409;
            throw err;
        }
    const updateData = {
       fullname,
       email
    };


    if (userData.phone !== undefined) {
        updateData.phone = phone;
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
    getAllCustomerForRental
}
