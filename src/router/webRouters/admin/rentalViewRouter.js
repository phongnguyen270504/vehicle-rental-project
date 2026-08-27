const express = require('express');
const router = express.Router();

const rentalViewController = require('../../../controllers/viewsController/admin/rentalViewController');

const authSessionMiddleware= require('../../../middlewares/auth.session.middleware');

router.post('/:id/confirm', authSessionMiddleware.isAdmin, rentalViewController.confirmRental);

router.post('/:id/cancel', authSessionMiddleware.isAdmin, rentalViewController.cancelRental);

router.post('/:id/complete', authSessionMiddleware.isAdmin ,rentalViewController.completeRental);

router.get('/:id', authSessionMiddleware.isAdmin, rentalViewController.rentalDetailPage);

router.get('/', authSessionMiddleware.isAdmin, rentalViewController.manageRentalsPage);



module.exports = router;