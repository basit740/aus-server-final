const mongoose = require('mongoose');

const jobRiskAssessment = new mongoose.Schema({
	scopeOfWork: String,
	permitNumber: Number,
	timeSigned: Number,
	location: String,
	equipment: String,
	approved: {
		type: Boolean,
		default: false,
	},
	//Whats
	whatToDo: {
		type: String,
	},
	whatGoWrong: {
		type: String,
	},
	howToPrevent: {
		type: String,
	},

	job: {
		type: mongoose.Schema.ObjectId,
		ref: 'Job',
		required: false,
	},

	//Teams
});

// TEAMS
jobRiskAssessment.virtual('teams', {
	ref: 'Team',
	localField: '_id',
	foreignField: 'jobRisk',
	justOne: false,
});

// DECLARATIONS
jobRiskAssessment.virtual('declarations', {
	ref: 'Declaration',
	localField: '_id',
	foreignField: 'jobRisk',
	justOne: false,
});

module.exports = new mongoose.model('JobRisk', jobRiskAssessment);
