const { Op } = require('sequelize');
const User = require('../models/User');
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
module.exports = {
    getAllUsers,
    getUserById,
}
