const getCourses = require('../services/courses');
const processCoursesData = require('./processData');
const { saveDataToFile } = require('../utils/fileHelpers');  // Assuming you have a utility function to save data to a file

async function fetchDataAndProcess() {
  try {
    const courses = await getCourses('https://atilim.edupage.org/timetable/server/regulartt.js?__func=regularttGetData');
    const processedData = processCoursesData(courses);
    saveDataToFile(processedData, 'public/coursesData.json');
  } catch (error) {
    console.error('Error fetching or processing data:', error);
  }
}

module.exports = {
  fetchDataAndProcess,
};
