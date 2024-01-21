const express = require('express');
const fs = require('fs');
const path = require('path');
const fetchDataAndProcess = require('./controller/dataFetcherController').fetchDataAndProcess;

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello World");
});

app.get('/courses', (req, res) => {
    const filePath = path.join(__dirname, 'public/coursesData.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ message: "Error reading data file" });
        } else {
            res.json(JSON.parse(data));
        }
    });
});

// ... (other routes and configurations)

// Schedule to run every 24 hours and on startup
setInterval(fetchDataAndProcess, 24 * 3600 * 1000);
fetchDataAndProcess();

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});
