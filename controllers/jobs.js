const Job = require('../models/Job');

// Create a New Job
exports.createJob = async (req, res, next) => {
	try {
		const job = await Job.create(req.body);

		if (job) {
			res.status(201).json({
				success: true,
				data: job,
			});
		}
	} catch (err) {
		res.status(400).json({
			success: false,
			message: err.message,
		});
	}
};

// Get all the jobs

exports.getJobs = async (req, res, next) => {
	try {
		const jobs = await Job.find(req.body);

		if (jobs) {
			res.status(200).json({
				success: true,
				data: jobs,
			});
		}
	} catch (err) {
		res.status(400).json({
			success: false,
			message: err.message,
		});
	}
};
