const {Router} = require('express');
const {registerUserController,loginUserController,logoutUserController,getMeController} =
 require('../controllers/auth.controller.js');
 const authMiddleware = require('../middlewares/auth.middleware.js');
const authRouter = Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post('/register', registerUserController);

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
authRouter.post('/login', loginUserController);

/**
 * @route GET /api/auth/logout
 * @desc clear token from user cookies and add token to blacklist
 * @access Public
 */

authRouter.get('/logout',logoutUserController); 

/**
 * @route GET /api/auth/get-me
 * @desc Get current user information
 * @access Private
 */

authRouter.get('/get-me', authMiddleware, getMeController);
module.exports = authRouter;