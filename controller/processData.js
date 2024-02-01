const processCoursesData = (courses) => {
    // Table extraction
    const lessonsTable = courses.r.dbiAccessorRes.tables.find(table => table.id === "lessons");
    const classroomsTable = courses.r.dbiAccessorRes.tables.find(table => table.id === "classrooms");
    const subjectsTable = courses.r.dbiAccessorRes.tables.find(table => table.id === "subjects");
    const periodsTable = courses.r.dbiAccessorRes.tables.find(table => table.id === "periods");
    const cardsTable = courses.r.dbiAccessorRes.tables.find(table => table.id === "cards");
    const teachersTable = courses.r.dbiAccessorRes.tables.find(table => table.id === "teachers");
    const daysDefsTable = courses.r.dbiAccessorRes.tables.find(table => table.id === "daysdefs");

    if (!lessonsTable || !classroomsTable || !subjectsTable || !periodsTable || !cardsTable || !teachersTable || !daysDefsTable) {
        console.error("Unable to find necessary tables");
        return null;
    }

    let coursesDictionary = {};

    for (const card of cardsTable.data_rows) {
        const lessonRow = lessonsTable.data_rows.find(row => row.id === card.lessonid);
        const periodRow = periodsTable.data_rows.find(row => row.id === card.period);
        if (!lessonRow || !periodRow) continue;

        // Extracting details using helper functions
        const teacherName = extractTeacherName(lessonRow, teachersTable);
        const classroomNames = extractClassroomNames(card, classroomsTable);
        const { subjectID, subjectName, courseID, sectionID, courseName } = extractSubjectInfo(lessonRow, subjectsTable);
        if (!subjectID || !courseName) continue;
        const dayName = extractDayName(card, daysDefsTable);

        const schedule = createSchedule(dayName, classroomNames, periodRow, lessonRow);
        updateCoursesDictionary(coursesDictionary, courseID, courseName, sectionID, teacherName, schedule);
    }

    return Object.values(coursesDictionary);
}

// Helper functions
function extractTeacherName(lessonRow, teachersTable) {
    if (!lessonRow.teacherids || lessonRow.teacherids.length === 0) {
        return "Unknown Teacher";
    }

    // Extracting the first teacher's ID and finding the corresponding teacher
    const firstTeacherID = lessonRow.teacherids[0];
    const teacher = teachersTable.data_rows.find(t => t.id === firstTeacherID);

    return teacher ? teacher.short : "Unknown Teacher";
}



function extractClassroomNames(card, classroomsTable) {
    return card.classroomids.map(cid => 
        classroomsTable.data_rows.find(c => c.id === cid)?.name
    ).filter(Boolean).join(", ");
}

function extractSubjectInfo(lessonRow, subjectsTable) {
    const subjectRow = subjectsTable.data_rows.find(subject => subject.id === lessonRow.subjectid);
    if (!subjectRow) return {};

    let courseID, sectionID, courseName;
    const subjectComponents = subjectRow.name.split('-').map(comp => comp.trim());

    // Adjusted logic to handle missing or non-standard course names
    courseID = subjectComponents[0] || "Unknown CourseID";
    sectionID = subjectComponents.length > 1 ? subjectComponents[1] : "Unknown SectionID";
    courseName = subjectComponents.slice(2).join(' - ') || courseID;

    return {
        subjectID: lessonRow.subjectid,
        subjectName: subjectRow.name,
        courseID: courseID,
        sectionID: sectionID,
        courseName: courseName
    };
}




function extractDayName(card, daysDefsTable) {
    const daysEncoded = card.days; // Assuming this is a string like '000100'

    // Find the day entry where its 'vals' array contains the 'daysEncoded' value
    const dayRow = daysDefsTable.data_rows.find(day => 
        day.vals && day.vals.includes(daysEncoded)
    );

    return dayRow ? dayRow.name : "Unknown Day";
}


function createSchedule(dayName, classroomNames, periodRow, lessonRow) {
    return {
        day: dayName,
        classroom: classroomNames,
        period: periodRow.name,
        startTime: periodRow.starttime,
        endTime: calculateEndTime(periodRow.starttime, lessonRow.durationperiods),
        duration: `${lessonRow.durationperiods} period(s)`
    };
}

function calculateEndTime(startTime, durationPeriods) {
    // Length of each period in minutes and break between periods
    const lengthOfPeriod = 50; // minutes
    const breakBetweenPeriods = 10; // minutes

    // Calculate total duration in minutes
    const totalDurationInMinutes = (durationPeriods * lengthOfPeriod) + ((durationPeriods - 1) * breakBetweenPeriods);

    // Parse the start time
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0); // sets hours and minutes, seconds and ms to 0

    // Calculate end time
    const endDate = new Date(startDate.getTime() + totalDurationInMinutes * 60000);

    // Format end time back into a string
    const endHours = endDate.getHours();
    const endMinutes = endDate.getMinutes();
    const endTimeString = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

    return endTimeString;
}


function updateCoursesDictionary(coursesDictionary, courseID, courseName, sectionID, teacherName, schedule) {
    if (schedule.day === "Unknown Day") {
        // If the day is "Unknown Day", skip adding this schedule.
        console.log(`Skipping schedule due to unknown day: ${JSON.stringify(schedule)}`);
        return;
    }

    if (!coursesDictionary[courseID]) {
        coursesDictionary[courseID] = {
            id: courseID,
            name: courseName,
            sections: []
        };
    }

    const sectionIndex = coursesDictionary[courseID].sections.findIndex(section => section.id === sectionID);
    if (sectionIndex > -1) {
        coursesDictionary[courseID].sections[sectionIndex].schedules.push(schedule);
    } else {
        coursesDictionary[courseID].sections.push({
            id: sectionID,
            teacher: { name: teacherName },
            schedules: [schedule]
        });
    }
}


module.exports = processCoursesData;
