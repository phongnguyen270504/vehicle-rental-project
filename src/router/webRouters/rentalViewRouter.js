const express = require('express');
const router = express.Router();

const rentalViewController = require('../../controllers/viewsController/rentalViewController');

const authSessionMiddleware= require('../../middlewares/auth.session.middleware');

router.get('/',rentalViewController.getMyRentals);

router.get('/:id', rentalViewController.getRentalId);

router.post('/:id/cancel',rentalViewController.rentalCancel)



module.exports = router;