const { createJob, getJobs } = require('../controllers/jobs');

const express = require('express');
const router = express.Router();

router.post('/', createJob);
router.get('/', getJobs);

module.exports = router;
