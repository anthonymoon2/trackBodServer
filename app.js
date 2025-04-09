const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const photoRoutes = require('./routes/photo');
const analysisRouter = require('./routes/analysis'); 
const scanRoutes = require('./routes/scan');
const userRoutes = require('./routes/userRoute');

const app = express();

// CORS
app.use(cors());

// JSON PARSER
app.use(express.json());

// Determine the environment
const ENV = process.env.NODE_ENV || 'development'; // Default to 'development' if undefined
const PORT = process.env.PORT || 8080;

// Log the environment
console.log(`Server is running in ${ENV} mode on port ${PORT}`);

// Register routers
app.use('/api/auth', authRoutes);
app.use('/api/photo', photoRoutes);
app.use('/api/analysis', analysisRouter);
app.use('/api/scan', scanRoutes);
app.use('/api/user', userRoutes);

// simple routes for aws beanstalk
app.get('/health', (req, res) => res.status(200).send('OK'));

app.get('/', (req, res) => {
    res.status(200).send('Welcome to the TrackBod API!');
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running in ${ENV} mode on port ${PORT}`);
});
