const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const colors = require('colors');
const morgan = require('morgan');
const path = require('path');

const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./db.js');

// IMPORT ROUTE FILES
// AUTHENTICATION
const auth = require('./routes/auth');
const jobs = require('./routes/jobs');

// CONFIGURATIONS
dotenv.config({
	path: '.env',
});

// connecting to db
connectDB();

// express app
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MOUNTIN ROURES
app.use('/api/v1/auth', auth);
app.use('/api/v1/jobs', jobs);

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () =>
	console.log('listening on port at port ' + PORT)
);

// ERROR HANDLER
app.use(errorHandler);
// TEST ENDPOINT
app.get('/test', (req, res) => {
	res.send('test endpoint working!');
});

app.use(logger);
// DEV dubbugin mode
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// handle unhandled promise rejections
process.on('unhandledRejection', (err, promose) => {
	console.log(`Error: ${err.message}`.red);

	// close the server
	server.close(() => process.exit(1));
});
