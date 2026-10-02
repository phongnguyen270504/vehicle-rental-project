const rentalViewRouter= require('./rentalViewRouter');
const userViewRouter= require('./userViewRouter');
const carViewRouter= require('./carViewRouter');
const adminViewController = require('../../../controllers/viewsController/admin/adminViewController');
const userViewController= require('../../../controllers/viewsController/admin/userViewController')
const router = require('express').Router();

router.get('/', (req, res) => {
    res.redirect('/admin/dashboard');
});
router.get('/dashboard', adminViewController.dashboardPage);
router.use('/rentals', rentalViewRouter );
router.use('/users', userViewRouter);
router.use('/cars', carViewRouter);
router.get('/profile', userViewController.adminDetailPage);

module.exports = router;