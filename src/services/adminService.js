const Car = require('../models/Car');
const Rental = require('../models/Rental');
const User = require('../models/User');
const { Op } = require('sequelize');

const getDashboardData = async () => {
    const totalCars= await Car.count();
    const totalCarsAvailable= await Car.count({ where: { status: 'available' } });

    const totalRentals= await Rental.count();
    const totalCustomers= await User.count({ where: { role: 'customer' } });
    const totalRevenue= await Rental.sum('total_price');
    return { 
        totalCars, 
        totalCarsAvailable, 
        totalRentals, 
        totalCustomers, 
        totalRevenue };
}

module.exports={
    getDashboardData,
}