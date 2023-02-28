const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
	client: String,
	time: Number,
	description: String,
});

module.exports = mongoose.model('Job', jobSchema);
