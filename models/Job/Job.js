const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
	client: String,
	time: Number,
	description: String,
	safety: {
		type: Boolean,
		default: false,
	},
	timesheet: {
		type: Boolean,
		default: false,
	},
	report: {
		type: Boolean,
		default: false,
	},
});

jobSchema.virtual('jobrisks', {
	ref: 'JobRisk',
	localField: '_id',
	foreignField: 'job',
	justOne: false,
});

module.exports = mongoose.model('Job', jobSchema);
