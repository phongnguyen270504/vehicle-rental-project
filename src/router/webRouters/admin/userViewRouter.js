const express = require('express');
const router = express.Router();

const userViewController = require('../../../controllers/viewsController/admin/userViewController');

router.get('/:id', userViewController.UserDetailPage);
router.get('/', userViewController.manageUsersPage);


module.exports = router;