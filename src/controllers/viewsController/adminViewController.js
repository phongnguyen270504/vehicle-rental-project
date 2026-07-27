const carService = require('../../services/carService');
const rentalService = require('../../services/rentalService');
const userService = require('../../services/userService');
const adminService= require('../../services/adminService');
const dashboardPage = async (req, res) => {
    try {
        const dashboardData = await adminService.getDashboardData();
        res.render('admin/dashboard.ejs', {
            title: 'Admin Dashboard',
            dashboardData,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const manageCarsPage = async (req, res) => {
    try {
        const results = await carService.getAllCars({
            ...req.query,
            limit: Number(req.query.limit) || 2
        });
        res.render('admin/manage-cars.ejs', {
            title: 'Quản lý xe',
            cars: results.cars,
            limit: results.limit,
            query: req.query,
            totalPages: results.totalPages,
            currentPage: results.currentPage,
            currentName: req.query.name || "",
            pagination: results.pagination,
        });
     } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
}

const manageRentalsPage= async (req, res) => {
   try {
        const results = await rentalService.getRentals({...req.query,limit: Number(req.query.limit) || 2});
        res.render('admin/manage-rentals.ejs',{
            title: 'Quản lý đơn thuê',
            limit: results.limit,
            query: req.query,
            rentals: results.rentals,
            totalPages: results.totalPages,
            currentPage: results.currentPage,
            pagination: results.pagination,
        });
   } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
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

module.exports = {dashboardPage, manageCarsPage, manageRentalsPage, manageUsersPage};