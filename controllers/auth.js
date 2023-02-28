// authorization & authentication
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const codeGenerator = require('../utils/codeGenerator');

const User = require('../models/User');

// REGISETER
exports.register = async (req, res, next) => {
	try {
		const user = await User.create(req.body);

		let token = '';
		if (user) {
			token = user.getSignedJwtToken();
		}

		if (user) {
			res.status(201).json({
				success: true,
				token: token,
			});
		} else {
			res.status(400).json({ success: false, data: null });
		}
	} catch (err) {
		next(err);
	}
};

// LOGIN
exports.login = async (req, res, next) => {
	try {
		const { username, password } = req.body;

		// Validate usernname and password
		if (!username || !password) {
			res.status(400).json({
				sucess: false,
				message: 'username or password not found',
			});
		}

		// Check for user
		const user = await User.findOne({ username }).select('+password');

		if (!user) {
			res.status(400).json({
				sucess: false,
				message: 'Invalid credentials',
			});
		}

		// check for password matches

		const isMatch = await user.matchPassword(password);

		if (!isMatch) {
			res.status(400).json({
				sucess: false,
				message: 'Invalid credentials',
			});
		}

		let token = user.getSignedJwtToken();

		res.status(200).json({
			success: true,
			token: token,
		});
	} catch (err) {
		next(err);
	}
};

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Public
exports.logout = async (req, res, next) => {
	res.cookie('token', 'none', {
		//
		maxAge: 1,
	});

	res.status(200).json({
		success: true,
		data: {},
	});
};
// @ Get User Profile
// @ Private

exports.getMe = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id);

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (err) {
		next(err);
	}
};

// @ Get User Profile
// @ Private

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
exports.updateDetails = async (req, res, next) => {
	const fieldsToUpdate = {
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
	};

	const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	});

	res.status(200).json({
		success: true,
		data: user,
	});
};

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = async (req, res, next) => {
	const user = await User.findById(req.user.id).select('+password');

	// Check current password
	if (!(await user.matchPassword(req.body.currentPassword))) {
		return next(new ErrorResponse('Password is incorrect', 401));
	}

	user.password = req.body.newPassword;
	await user.save();

	sendTokenResponse(user, 200, res);
};

//
// @ Public

exports.forgotPassword = async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		return next(new ErrorResponse('There is no user with that email', 404));
	}

	// Get reset token
	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: false });

	// Create reset url
	const resetUrl = `${req.protocol}://${req.get(
		'host'
	)}/api/v1/auth/resetpassword/${resetToken}`;

	const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Password reset token',
			message,
		});

		res.status(200).json({ success: true, data: 'Email sent' });
	} catch (err) {
		console.log(err);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save({ validateBeforeSave: false });

		return next(new ErrorResponse('Email could not be sent', 500));
	}
};

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = async (req, res, next) => {
	// Get hashed token
	// const resetPasswordToken = crypto
	// 	.createHash('sha256')
	// 	.update(req.params.resettoken)
	// 	.digest('hex');

	// const user = await User.findOne({
	// 	resetPasswordToken,
	// 	resetPasswordExpire: { $gt: Date.now() },
	// });

	// if (!user) {
	// 	return next(new ErrorResponse('Invalid token', 400));
	// }

	// Set new password

	const user = await User.findOne({ email: req.params.email });

	if (!user) {
		return next(new ErrorResponse('There is no user with that email', 404));
	}
	user.password = req.params.password;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;
	user.resetCode = '';
	await user.save();

	// sendTokenResponse(user, 200, res);

	res.status(200).json({
		success: true,
		message: 'password updated successfully',
	});
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
	// Create token
	const token = user.getSignedJwtToken();

	const options = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};

	if (process.env.NODE_ENV === 'production') {
		options.secure = true;
	}

	res.status(statusCode).cookie('token', token, options).json({
		success: true,
		token,
	});
};

// send 4 digit code

exports.sendCode = async (req, res, next) => {
	const user = await User.findOne({ email: req.params.email });

	if (!user) {
		return next(new ErrorResponse('There is no user with that email', 404));
	}

	const code = codeGenerator();
	const fieldsToUpdate = {
		resetCode: code,
	};

	const updatedUser = await User.findByIdAndUpdate(user._id, fieldsToUpdate, {
		new: true,
		runValidators: true,
	});

	const options = {
		subject: 'Password Reset Code',
		email: req.params.email,
		message: `<div>
			<p>Hi there, </p>
			<p>Following is your 4 digit code from <strong>My Therapy Tool</strong> </p>
			<p>${code}</p>
		</div>`,
	};
	const result = await sendEmail(options);

	console.log(result);

	if (result.rejected.length === 0) {
		res.status(200).json({
			success: true,
			message: 'code is sent',
		});
	} else {
		res.status(400).json({
			success: true,
			message: 'code was not sent',
		});
	}
};

exports.verifyCode = async (req, res, next) => {
	const email = req.params.email;
	const code = req.params.code;

	const user = await User.findOne({ email: req.params.email });

	if (!user) {
		return next(new ErrorResponse('There is no user with that email', 404));
	}

	if (user.resetCode != code) {
		return next(
			new ErrorResponse('The code is wrong, please check again', 404)
		);
	}

	res.status(200).json({
		success: true,
		message: 'You are good to go',
	});
};
