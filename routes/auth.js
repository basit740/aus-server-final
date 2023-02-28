const express = require('express');
const {
	register,
	login,
	logout,
	getMe,
	updateDetails,
	updatePassword,
	forgotPassword,
	resetPassword,
	sendCode,
	verifyCode,
} = require('../controllers/auth');

const { protect } = require('../middleware/auth');
const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(protect, logout);
router.route('/me').get(protect, getMe);
router.route('/updatedetails').put(protect, updateDetails);
router.route('/updatepassword').put(protect, updatePassword);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:email/:password').get(resetPassword);
router.route('/sendCode/:email').get(sendCode);
router.route('/verifyCode/:email/:code').get(verifyCode);

module.exports = router;
