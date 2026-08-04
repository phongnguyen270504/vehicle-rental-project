const rentalViewRouter= require('../rentalViewRouter');
const router = require('express').Router();

router.use('/rentals', rentalViewRouter);

module.exports = router;