const express = require('express');
const router = express.Router();
const carViewController = require('../../../controllers/viewsController/admin/carViewController');
const authSessionMiddleware= require('../../../middlewares/auth.session.middleware');
const uploadMiddleware= require('../../../middlewares/upload.middleware');

router.get('/', carViewController.indexPage);

router.get('/create',

    carViewController.createCarPage);
router.post('/create', 
    
    uploadMiddleware,
    carViewController.createCar);

router.post('/:id/delete', 
    
    carViewController.deleteCar);

router.get('/:id/update', 
    
    carViewController.updateCarPage);
router.post('/:id/update',
     
    uploadMiddleware,
    carViewController.updateCar);

// router.get('/:id/booking',
//     authSessionMiddleware.isLogin
//     , carViewController.bookingCarPage);
// router.post('/:id/booking', 
//     authSessionMiddleware.isLogin,
//     carViewController.bookingCar);

router.get('/:id', carViewController.getCarById);



module.exports = router;