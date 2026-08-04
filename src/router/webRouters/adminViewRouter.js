const express = require('express');
const router = express.Router();
const adminViewController = require('../../controllers/viewsController/adminViewController');

router.get('/dashboard', adminViewController.dashboardPage);

router.get('/manage-cars', adminViewController.manageCarsPage);
router.get('/manage-rentals', adminViewController.manageRentalsPage);
router.get('/manage-users', adminViewController.manageUsersPage);


module.exports = router;