const express = require('express');
const router = express.Router();
const carViewController = require('../../controllers/viewsController/carViewController');
const authSessionMiddleware= require('../../middlewares/auth.session.middleware');
const uploadMiddleware= require('../../middlewares/upload.middleware');

router.get('/', carViewController.indexPage);


router.get('/:id/booking',
    authSessionMiddleware.isLogin
    , carViewController.bookingCarPage);
router.post('/:id/booking', 
    authSessionMiddleware.isLogin,
    carViewController.bookingCar);

router.get('/:id', carViewController.getCarById);



module.exports = router;