const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes

exports.protect = async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		token = req.headers.authorization.split(' ')[1];
		// } else if (req.cookies.token) {
		// 	token = req.cookies.token;
		// }
	}
	// Check if token exists

	if (!token) {
		return next(new ErrorResponse('not authorized to access this route', 401));
	}

	// verify token

	try {
		const decoded = jwt.verify(token, '23784iusyrjhaskd13hckad'); // process.env.JWT_SECRET

		req.user = await User.findById(decoded.id);
		next();
	} catch (err) {
		next(err);
	}
};
