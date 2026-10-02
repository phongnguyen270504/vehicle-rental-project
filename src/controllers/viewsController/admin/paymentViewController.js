const paymentService = require('../../../services/paymentService');

const paymentPage = async (req, res) => {
    try {
       const rentalId = req.params.id;
        const rental = await paymentService.getRentalForPayment(rentalId);
        res.render('admin/payment-create', {
            title: 'Tạo thanh toán',
            rental
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
};

const createPayment = async (req, res) => {
    try {
        const rentalId = req.params.id;
        const paymentMethod = req.body.paymentMethod;
        const user = req.session.user ? req.session.user : null;
        const payment = await paymentService.createPayment(rentalId, paymentMethod, user);
        res.redirect(`/admin/rentals/${rentalId}`);
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }

};

module.exports = {
    paymentPage,
    createPayment
};