const Job = require('../models/Job/Job');
const JobRisk = require('../models/Job/JobRiskAssessment');
const Declaration = require('../models/Job/Declaration');
const Team = require('../models/Job/Team');

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

// get Single Job

exports.getJob = async (req, res, next) => {
	try {
		const job = await Job.findById(req.params.id);
		// now try composing all the related content with job

		// get job Risk
		// get teams
		// get declrations
		// get whats possibly

		// JOB Risk
		const jobRisk = await JobRisk.find({
			job: job._id,
		});

		if (jobRisk.length > 0) {
			// only then get related data

			const teams = await Team.find({
				jobRisk: jobRisk[0]._id,
			});

			const declrations = await Declaration.find({
				jobRisk: jobRisk[0]._id,
			});

			// const newObj = JSON.parse(JSON.stringify(job.toJSON()));

			const newJob = JSON.parse(JSON.stringify(job.toJSON()));
			const newJobRisk = JSON.parse(JSON.stringify(jobRisk[0].toJSON()));

			newJobRisk['teams'] = [...teams];
			newJobRisk['declrations'] = [...declrations];

			const composedJob = {
				...newJob,
				jobRisk: { ...newJobRisk },
			};

			res.status(200).json({
				success: true,
				data: {
					job: composedJob,
				},
			});
		} else {
			res.status(200).json({
				success: true,
				data: {
					job: job,
				},
			});
		}

		// if (jobs) {
		// 	res.status(200).json({
		// 		success: true,
		// 		data: jobs,
		// 	});
		// }
	} catch (err) {
		res.status(400).json({
			success: false,
			message: err.message,
		});
	}
};

// Add or Update TaskRisk

exports.createOrUpdateTaskRisk = async (req, res, next) => {
	const {
		scopeOfWork,
		timeSigned,
		permitNumber,
		location,
		equipment,
		approved,
	} = req.body;
	try {
		// declarations
		// teams
		// whats

		// const job = await Job.create(req.body);

		// find if jobRisk is found with jobId
		const jobRisk = await JobRisk.find({
			job: req.params.id,
		});

		if (jobRisk.length !== 0) {
			// udpate all the job risk related data
			// do other steps

			// DELETE MANY  Teams and declarations
			const teamsDeleted = await Team.deleteMany({
				jobRisk: jobRisk[0]._id,
			});

			const decDeleted = await Declaration.deleteMany({
				jobRisk: jobRisk[0]._id,
			});

			// Teams
			const teams = [...req.body.teams];

			teams.map((team) => {
				team['jobRisk'] = jobRisk[0]._id;
			});
			const returnedTeams = await Team.insertMany(teams);

			// Declarations;
			const declarations = [...req.body.declarations];
			declarations.map((dec) => {
				dec['jobRisk'] = jobRisk[0]._id;
			});
			const returnedDeclarations = await Declaration.insertMany(declarations);

			// Update jobRisk again

			const resposne = await JobRisk.findByIdAndUpdate(jobRisk[0]._id, {
				scopeOfWork,
				permitNumber,
				timeSigned,
				location,
				equipment,
				approved,
				whatToDo: req.body.whats[0].whatContent,
				whatGoWrong: req.body.whats[1].whatContent,
				howToPrevent: req.body.whats[1].whatContent,
			});
			if (response) {
				res.status(200).json({
					success: true,
					flag: 'udpated',
					data: resposne,
				});
			}
		} else {
			// create jobRisk

			const jobRiskMinimum = {
				scopeOfWork,
				permitNumber,
				timeSigned,
				location,
				equipment,
				approved,
				whatToDo: req.body.whats[0].whatContent,
				whatGoWrong: req.body.whats[1].whatContent,
				howToPrevent: req.body.whats[1].whatContent,
				job: req.params.id,
			};
			const jobRisk = await JobRisk.create(jobRiskMinimum);

			// now create DECLARATIONS, TEAMS

			// Teams
			const teams = [...req.body.teams];
			teams.map((team) => {
				team['jobRisk'] = jobRisk._id;
			});
			const returnedTeams = await Team.insertMany(teams);

			// Declarations;
			const declarations = [...req.body.declarations];
			declarations.map((dec) => {
				dec['jobRisk'] = jobRisk._id;
			});
			const returnedDeclarations = await Declaration.insertMany(declarations);

			if (returnedDeclarations.length > 0) {
				// also udpate Job

				const updated = await Job.findByIdAndUpdate(req.params.id, {
					safety: true,
				});
				res.status(200).json({
					success: true,
					flag: 'created',
					message: 'Job Risk Created',
				});
			}
		}

		return;
	} catch (err) {
		res.status(400).json({
			success: false,
			message: err.message,
		});
	}
};
