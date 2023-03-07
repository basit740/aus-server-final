const mongoose = require('mongoose');

const declaration = new mongoose.Schema({
	title: String,
	checked: {
		type: Boolean,
		default: false,
	},
	jobRisk: {
		type: mongoose.Schema.ObjectId,
		ref: 'JobRisk',
		required: false,
	},
});

module.exports = mongoose.model('Declaration', declaration);
