const axios = require('axios');
const cheerio = require('cheerio');
const { saveDataToFile } = require('../utils/fileHelpers');

async function fetchGeneralFinalExams() {

    try {
        const url = "https://dersprogramiyukle.atilim.edu.tr/20232024finalbahar/servis/index_files/sheet001.htm"
        let reponse = await axios.get(url);
        const html = reponse.data;
        const $ = cheerio.load(html);
        const courses = [];

        $('tr').each((i, el) => {
            if (i > 0) { // Skipping the header
                let courseCode = $(el).find('td').eq(0).text().trim();
                const date = $(el).find('td').eq(2).text().trim();
                let time = $(el).find('td').eq(4).text().trim();


                courseCode = courseCode.replace(/\s\s+/g, ' ');
                time = time.replace(/\n/g, ' ').replace(/\s+\(/g, ' (');

                if(courseCode && courseCode != "DERS KODU/ COURSE CODE" && courseCode != 'SBOD Dersleri 2023-2024 Bahar Dönemi Final Tarihleri' && courseCode != 'ATILIM ÜNİVERSİTESİ' && courseCode != "Fizik Grubu Servis Dersleri 2023-2024 Bahar Dönemi Final Tarihleri" && courseCode != "Kimya Grubu Servis Dersleri 2023-2024 Bahar Dönemi Final Tarihleri" && courseCode != "Mühendislik Fakültesi Servis Dersleri 2023-2024 Bahar Dönemi Final Tarihleri" && courseCode != "Matematik Servis Dersleri 2023-2024 Bahar Dönemi Final Tarihleri") {
                    courses.push({ courseCode, date, time });
                }
            }
        });

        const filePath = './public/FinalExams/GeneralFinalExams.json';
        saveDataToFile(courses, filePath);
    } catch (error) {
        console.log(error);
        throw error;
    }
}


module.exports = {
    fetchGeneralFinalExams
}