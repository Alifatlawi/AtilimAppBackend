const axios = require('axios');
const cheerio = require('cheerio');
const { saveDataToFile } = require('../utils/fileHelpers');


async function fetchMidExams() {
    try {
        const url = 'https://dersprogramiyukle.atilim.edu.tr/20232024arasinavbahar/muh/index_files/sheet001.htm';
        // const url = 'https://dersprogramiyukle.atilim.edu.tr/20232024arasinavbahar/servis/index_files/sheet001.htm'
        let response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const courses = [];

        $('tr').each((i, el) => {
            if (i > 0) { // Assuming you want to skip the first row/header
                const courseCode = $(el).find('td').eq(2).text().trim();
                const date = $(el).find('td').eq(4).text().trim(); 
                const time = $(el).find('td').eq(6).text().trim();

                // Only add courses with a course code
                if(courseCode && courseCode != "DERS KODU/ COURSE CODE" && courseCode != 'DERS\n  KODU/              COURSE CODE') {
                    courses.push({ courseCode, date, time });
                }
            }
        });


        const filePath = './public/EngMidExams.json'; // Adjust the path as needed
        saveDataToFile(courses, filePath);
    } catch (error) {
        console.error(error);
        throw error; // Throw the error to be caught by the caller
    }
}

async function fetchGeneralCoursesExams() {
    try {
        // Adjust the URL to the one containing general courses exams
        const url = 'https://dersprogramiyukle.atilim.edu.tr/20232024arasinavbahar/servis/index_files/sheet001.htm';
        let response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const courses = [];
        $('tr').each((i, el) => {
            if (i > 0) { // Assuming you want to skip the first row/header
                // Adjust these selectors if the table structure is different for general courses
                const courseCode = $(el).find('td').eq(0).text().trim();
                const date = $(el).find('td').eq(2).text().trim(); 
                const time = $(el).find('td').eq(4).text().trim();

                if(courseCode && courseCode != "DERS KODU/ COURSE CODE" && courseCode != 'DERS KODU/                      \n  COURSE CODE' && courseCode != 'ATILIM ÜNİVERSİTESİ') {
                    courses.push({ courseCode, date, time });
                }
            }
        });

        // Adjust the file path/name as needed for general courses
        const filePath = './public/GenCoursesExams.json'; 
        saveDataToFile(courses, filePath);
    } catch (error) {
        console.error(error);
        throw error; // Throw the error to be caught by the caller
    }
}


module.exports = {
    fetchMidExams,
    fetchGeneralCoursesExams
}