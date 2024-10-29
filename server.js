const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json());

const dataFilePath = path.join(__dirname, 'storage.json');

// Load JSON data
app.get('/data', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error reading data file.");
        res.json(JSON.parse(data));
    });
});

// Update JSON data with new question-answer pairs
app.post('/data', (req, res) => {
    const newData = req.body;
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error reading data file.");

        const jsonData = JSON.parse(data);
        Object.assign(jsonData, newData);

        fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), err => {
            if (err) return res.status(500).send("Error writing to data file.");
            res.status(200).send("Data updated successfully.");
        });
    });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
