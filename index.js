const express = require('express');
const getCourses = require('./services/courses'); 
const processCoursesData = require('./controller/processData');

const app = express();
app.use(express.json());


app.get('/', (req, res) => {
    res.send("Hello World");
});


app.get('/courses', async (req, res) => {
    const url = 'https://atilim.edupage.org/timetable/server/regulartt.js?__func=regularttGetData'; // Replace with your URL
    try {
        const courses = await getCourses(url);
        const processedData = processCoursesData(courses);

        if (processedData) {
            res.json(processedData);
        } else {
            res.status(500).json({ message: "Error processing data" });
        }
        
    } catch (error) {
        res.status(500).json({message: error.message});
    }
});

const port = 4000;
app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});