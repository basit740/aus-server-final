const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
	name: String,
	badgeNumber: Number,
	signature: String,
	jobRisk: {
		type: mongoose.Schema.ObjectId,
		ref: 'JobRisk',
		required: false,
	},
});

module.exports = mongoose.model('Team', teamSchema);
