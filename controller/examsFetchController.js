const axios = require('axios');
const cheerio = require('cheerio');
const { saveDataToFile } = require('../utils/fileHelpers');


async function fetchMidExams() {
    try {
        const url = 'https://dersprogramiyukle.atilim.edu.tr/20232024arasinavbahar/muh/index_files/sheet001.htm';
        let response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const examsByCourse = {};

        $('tr').each((i, el) => {
            if (i > 0) { // Skipping the header
                const courseCode = $(el).find('td').eq(2).text().trim();
                const date = $(el).find('td').eq(4).text().trim();
                const time = $(el).find('td').eq(6).text().trim();

                if (courseCode && courseCode != "DERS KODU/ COURSE CODE" && courseCode != 'DERS\n  KODU/              COURSE CODE' && courseCode != "DERS\n  KODU/              COURSE CODE") {
                    if (!examsByCourse[courseCode]) {
                        examsByCourse[courseCode] = [];
                    }
                    examsByCourse[courseCode].push({ date, time });
                }
            }
        });

        // Generating courses array with modified course codes for duplicate exams
        const courses = [];
        Object.keys(examsByCourse).forEach((courseCode, index) => {
            examsByCourse[courseCode].forEach((exam, examIndex) => {
                const modifiedCourseCode = examsByCourse[courseCode].length > 1 ? `${courseCode}-${examIndex + 1}` : courseCode;
                courses.push({ courseCode: modifiedCourseCode, ...exam });
            });
        });

        const filePath = './public/EngMidExams.json'; // Adjust the path as needed
        saveDataToFile(courses, filePath);
    } catch (error) {
        console.error(error);
        throw error; // Rethrowing the error for the caller to handle
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
                let courseCode = $(el).find('td').eq(0).text().trim();
                const date = $(el).find('td').eq(2).text().trim(); 
                const time = $(el).find('td').eq(4).text().trim();

                // Replace multiple spaces (including newlines and tabs) with a single space
                courseCode = courseCode.replace(/\s\s+/g, ' ');

                if(courseCode && courseCode != "DERS KODU/ COURSE CODE" && courseCode != 'DERS KODU/                      COURSE CODE' && courseCode != 'ATILIM ÜNİVERSİTESİ') {
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
                let courseCode = $(el).find('td').eq(0).text().trim();
                const date = $(el).find('td').eq(2).text().trim(); 
                const time = $(el).find('td').eq(4).text().trim();

                // Replace multiple spaces (including newlines and tabs) with a single space
                courseCode = courseCode.replace(/\s\s+/g, ' ');

                if(courseCode && courseCode != "DERS KODU/ COURSE CODE" && courseCode != 'DERS KODU/                      COURSE CODE' && courseCode != 'ATILIM ÜNİVERSİTESİ') {
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


async function fetchBussMidExams(){
    try {
        // Adjust the URL to the one containing general courses exams
        const url = 'https://dersprogramiyukle.atilim.edu.tr/20232024arasinavbahar/isletme/index_files/sheet001.htm';
        let response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const courses = [];
        $('tr').each((i, el) => {
            if (i > 0) { // Assuming you want to skip the first row/header
                // Adjust these selectors if the table structure is different for general courses
                const courseCode = $(el).find('td').eq(2).text().trim();
                const date = $(el).find('td').eq(4).text().trim(); 
                const time = $(el).find('td').eq(6).text().trim();

                if(courseCode && courseCode != "DERS KODU/ COURSE CODE" && courseCode != 'DERS\n  KODU/              COURSE CODE' && courseCode != 'ATILIM ÜNİVERSİTESİ') {
                    courses.push({ courseCode, date, time });
                }
            }
        });

        // Adjust the file path/name as needed for general courses
        const filePath = './public/BussCoursesExams.json'; 
        saveDataToFile(courses, filePath);
    } catch (error) {
        console.error(error);
        throw error; // Throw the error to be caught by the caller
    }
}


async function fetchAviMidExams(){
    try {
        // Adjust the URL to the one containing general courses exams
        const url = 'https://dersprogramiyukle.atilim.edu.tr/20232024arasinavbahar/cav/index_files/sheet001.htm';
        let response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const courses = [];
        $('tr').each((i, el) => {
            if (i > 0) { // Assuming you want to skip the first row/header
                // Adjust these selectors if the table structure is different for general courses
                const courseCode = $(el).find('td').eq(1).text().trim();
                const date = $(el).find('td').eq(3).text().trim(); 
                const time = $(el).find('td').eq(5).text().trim();

                if(courseCode && courseCode != "DERS KODU/ COURSE CODE" && courseCode != "DERS\n  KODU/              COURSE CODE" && courseCode != 'ATILIM ÜNİVERSİTESİ' && courseCode != "SİVİL HAVACILIK YÜKSEK OKULU/ SCHOOL OF CIVIL\n  AVIATION" && time != "") {
                    courses.push({ courseCode, date, time });
                }
            }
        });

        // Adjust the file path/name as needed for general courses
        const filePath = './public/CavCoursesExams.json'; 
        saveDataToFile(courses, filePath);
    } catch (error) {
        console.error(error);
        throw error; // Throw the error to be caught by the caller
    }
}

async function fetchfefMidExams(){
    try {
        // Adjust the URL to the one containing general courses exams
        const url = 'https://dersprogramiyukle.atilim.edu.tr/20232024arasinavbahar/fef/index_files/sheet001.htm';
        let response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const courses = [];
        $('tr').each((i, el) => {
            if (i > 0) { // Assuming you want to skip the first row/header
                // Adjust these selectors if the table structure is different for general courses
                const courseCode = $(el).find('td').eq(2).text().trim();
                const date = $(el).find('td').eq(4).text().trim(); 
                const time = $(el).find('td').eq(6).text().trim();

                if(courseCode && courseCode != "DERS KODU/ COURSE CODE" && courseCode != "DERS\n  KODU/              COURSE CODE" && courseCode != 'ATILIM ÜNİVERSİTESİ') {
                    courses.push({ courseCode, date, time });
                }
            }
        });

        // Adjust the file path/name as needed for general courses
        const filePath = './public/fefCoursesExams.json'; 
        saveDataToFile(courses, filePath);
    } catch (error) {
        console.error(error);
        throw error; // Throw the error to be caught by the caller
    }
}


async function fetchgsodMidExams(){
    try {
        // Adjust the URL to the one containing general courses exams
        const url = 'https://dersprogramiyukle.atilim.edu.tr/20232024arasinavbahar/gsod/index_files/sheet001.htm';
        let response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const courses = [];
        $('tr').each((i, el) => {
            if (i > 0) { // Assuming you want to skip the first row/header
                // Adjust these selectors if the table structure is different for general courses
                const courseCode = $(el).find('td').eq(2).text().trim();
                const date = $(el).find('td').eq(4).text().trim(); 
                const time = $(el).find('td').eq(6).text().trim();

                if(courseCode && courseCode != "DERS KODU/ COURSE CODE" && courseCode != "DERS\n  KODU/              COURSE CODE" && courseCode != 'ATILIM ÜNİVERSİTESİ' && time != "") {
                    courses.push({ courseCode, date, time });
                }
            }
        });

        // Adjust the file path/name as needed for general courses
        const filePath = './public/gsodCoursesExams.json'; 
        saveDataToFile(courses, filePath);
    } catch (error) {
        console.error(error);
        throw error; // Throw the error to be caught by the caller
    }
}

module.exports = {
    fetchMidExams,
    fetchGeneralCoursesExams,
    fetchBussMidExams,
    fetchAviMidExams,
    fetchfefMidExams,
    fetchgsodMidExams
}