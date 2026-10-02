const Payment = require('../models/Payment');
const Rental = require('../models/Rental');
const Car = require('../models/Car');

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

const createPayment = async (rentalId,  paymentMethod) => {

    // Check if the rental exists
    const rental = await Rental.findByPk(rentalId);
    if (!rental) {
        const err = new Error('Không tìm thấy đơn thuê');
        err.statusCode = 404;
        throw err;
    }

    if (rental.status === 'cancelled') {
        const err = new Error('Đơn thuê đã bị hủy');
        err.statusCode = 400;
        throw err;
    }

     const existingPayment = await Payment.findOne({
        where: {
            rental_id: rentalId
        }
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
    });

    return payment;
};

module.exports = {
    getRentalForPayment,
    createPayment,
};