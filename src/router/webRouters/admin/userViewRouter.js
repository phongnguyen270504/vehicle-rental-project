const express = require('express');
const router = express.Router();

const userViewController = require('../../../controllers/viewsController/admin/userViewController');
const validateUserMiddleware = require('../../../middlewares/validate.view.users.middlware');

router.get('/create', userViewController.createUserPage);
router.post('/create',userViewController.createUser);

router.get('/:id/edit', userViewController.updateUserPage);
router.post('/:id/edit', validateUserMiddleware.validateUpdateUser, userViewController.updateUser);

router.get('/:id', userViewController.UserDetailPage);

router.get('/', userViewController.manageUsersPage);

router.post('/:id/delete', userViewController.deleteUser);
router.post('/:id/restore', userViewController.restoreUser);

module.exports = router;