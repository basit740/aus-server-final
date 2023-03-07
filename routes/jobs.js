const {
	createJob,
	getJobs,
	getJob,
	createOrUpdateTaskRisk,
} = require('../controllers/jobs');

const express = require('express');
const router = express.Router();

router.post('/', createJob);
router.get('/', getJobs);
router.get('/:id', getJob);
router.put('/taskrisk/:id', createOrUpdateTaskRisk);

module.exports = router;
