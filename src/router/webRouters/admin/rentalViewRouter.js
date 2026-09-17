const express = require('express');
const router = express.Router();

const rentalViewController = require('../../../controllers/viewsController/admin/rentalViewController');


router.get('/create',rentalViewController.rentalCreatePage);

router.post('/create',rentalViewController.rentalCreate);

router.post('/:id/confirm',  rentalViewController.confirmRental);

router.post('/:id/cancel',  rentalViewController.cancelRental);

router.post('/:id/complete', rentalViewController.completeRental);

router.get('/:id',  rentalViewController.rentalDetailPage);

router.get('/',  rentalViewController.manageRentalsPage);



module.exports = router;