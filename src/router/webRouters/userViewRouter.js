const express = require('express');
const router = express.Router();

const userViewController = require('../../controllers/viewsController/userViewController');

const authSessionMiddleware= require('../../middlewares/auth.session.middleware');

const validateUserMiddleware= require('../../middlewares/validate.view.users.middlware');

router.get('/edit',userViewController.updateUserPage);

router.post('/edit',validateUserMiddleware.validateUpdateUser,userViewController.updateUser);




module.exports = router;