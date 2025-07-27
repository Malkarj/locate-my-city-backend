// server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');


const app = express();

// Configure CORS properly
const corsOptions = {
  origin: 'http://localhost:3000', 
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const PORT = 3001;


let rockCities = [];
let springCities = {};

function flattenStateGroupedData(data) {
    let result = [];
    for (const state in data) {
        result = result.concat(data[state].map(item => ({...item, state})));
    }
    return result;
}

try {
    rockCities = JSON.parse(fs.readFileSync(path.join(__dirname, 'rock_cities.json'), 'utf8'));
} catch (error) {
    console.error('Error loading rock_cities.json:', error.message);
    rockCities = []; // Fallback to empty array
}

try {
    springCities = JSON.parse(fs.readFileSync(path.join(__dirname, 'spring_cities.json'), 'utf8'));
} catch (error) {
    console.error('Error loading spring_cities.json:', error.message);
    springCities = {}; // Fallback to empty object
}


// Serve location data
app.get('/api/locations', (req, res) => {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'rock_cities.json')));
    res.json(data);
});

// Serve states list
app.get('/api/states', (req, res) => {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'rock_cities.json')));
    const states = [...new Set(data.map(item => item.state))].sort();
    res.json(states);
});

// Serve locations by state
app.get('/api/locations/:state', (req, res) => {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'rock_cities.json')));
    const stateLocations = data.filter(item => item.state === req.params.state);
    res.json(stateLocations);
});


app.get('/api/springs', (req, res) => {
    res.json(springCities);
});

// Serve all spring locations as flat array
app.get('/api/springs/flat', (req, res) => {
    const flatSprings = flattenStateGroupedData(springCities);
    res.json(flatSprings);
});

// Serve states list for spring cities
app.get('/api/springs/states', (req, res) => {
    const states = Object.keys(springCities).sort();
    res.json(states);
});

// Serve spring locations by state
app.get('/api/springs/:state', (req, res) => {
    const stateLocations = springCities[req.params.state] || [];
    res.json(stateLocations);
});

// COMMON STATS ENDPOINTS

// Get counts for both types
app.get('/api/stats', (req, res) => {
    const flatSprings = flattenStateGroupedData(springCities);
    
    res.json({
        rockCities: {
            total: rockCities.length,
            states: [...new Set(rockCities.map(item => item.state))].length
        },
        springCities: {
            total: flatSprings.length,
            states: Object.keys(springCities).length
        }
    });
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});