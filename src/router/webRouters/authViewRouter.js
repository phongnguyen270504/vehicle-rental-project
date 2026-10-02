const express = require('express');
const router = express.Router();
const authController = require('../../controllers/viewsController/authViewController');

const authSessionMiddleware= require('../../middlewares/auth.session.middleware');

router.get('/login', authController.loginPage);

router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.get('/register', authController.registerPage);
router.post('/register', authController.register);

router.get('/change_password',authSessionMiddleware.isLogin,authController.changePasswordPage);
router.post('/change_password',authSessionMiddleware.isLogin,authController.changePassword);

module.exports = router;