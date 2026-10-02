const Payment = require('../models/Payment');
const Rental = require('../models/Rental');
const Car = require('../models/Car');
const { sequelize } = require('../models/db');

const getRentalForPayment  = async (rentalId) => {
    // Check if the rental exists
    const rental = await Rental.findByPk(rentalId,{
        include: [
            {
                model: Car
            }
        ]
    });
    if (!rental) {
        const err = new Error('Không tìm thấy đơn thuê');
        err.statusCode = 404;
        throw err;
    }
    
    return rental;
};

const createPayment = async (rentalId,  paymentMethod, user) => {

    const transaction = await sequelize.transaction();
    try {
    if((!user || user.role !== 'admin') && paymentMethod === 'cash'){
            const err = new Error('Bạn không có quyền thanh toán đơn thuê này');
            err.statusCode = 403;
            throw err;
        }
    if(paymentMethod !== 'cash'){
        const err = new Error('Phương thức thanh toán không hợp lệ');
        err.statusCode = 400;
        throw err;
    }
    // Check if the rental exists
     const rental = await Rental.findByPk(rentalId, {
            transaction,
            lock: transaction.LOCK.UPDATE
        });
    if (!rental) {
        const err = new Error('Không tìm thấy đơn thuê');
        err.statusCode = 404;
        throw err;
    }

    if(rental.status !== 'active'){
        const err = new Error('Chỉ có thể thanh toán đơn thuê ở trạng thái đang hoạt động');
        err.statusCode = 400;
        throw err;
    }
    
    

    const existingPayment = await Payment.findOne({
        where: {
            rental_id: rentalId
        },
         transaction
    });

    if (existingPayment) {
        const err = new Error('Đơn thanh toán đã tồn tại');
        err.statusCode = 400;
        throw err;
    }
    
    // Create the payment
     const payment = await Payment.create({
        rental_id: rentalId,
        amount: rental.total_price,
        payment_method: paymentMethod,
        status: 'paid',
        paid_at: new Date()
    },{
        transaction,
    });

    rental.status = 'completed';
    await rental.save({transaction});

    await transaction.commit();

    return payment;
    }
    catch (err) {
        await transaction.rollback();
        throw err;
    }
};

module.exports = {
    getRentalForPayment,
    createPayment,
};