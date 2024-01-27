const MIN_GAP_MINUTES = 30; // Minimum gap required between two classes

// Function to convert time in "HH:MM" format to minutes
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

// Function to check if two schedules overlap, considering the minimum gap
function overlaps(s1, s2) {
    // Convert the Turkish day names to English
    const turkishToEnglishDays = {
        "Pazartesi": "Monday",
        "Salı": "Tuesday",
        "Çarşamba": "Wednesday",
        "Perşembe": "Thursday",
        "Cuma": "Friday",
        "Cumartesi": "Saturday",
        "Pazar": "Sunday"
    };

    const s1Day = turkishToEnglishDays[s1.day];
    const s2Day = turkishToEnglishDays[s2.day];

    const s1Start = timeToMinutes(s1.startTime);
    const s1End = timeToMinutes(s1.endTime) + MIN_GAP_MINUTES; // Add MIN_GAP_MINUTES to the end time
    const s2Start = timeToMinutes(s2.startTime);
    const s2End = timeToMinutes(s2.endTime);

    // Check for both day and time overlaps considering the minimum gap
    return s1Day === s2Day && !(s2Start >= s1End || s1Start >= s2End);
}

// Function to check if adding a new section to the current schedule will cause any conflict
function hasConflict(schedule, sectionToAdd) {
    for (const item of schedule) {
        const scheduledSection = item.section;

        for (const scheduledSchedule of scheduledSection.schedules) {
            for (const scheduleToAdd of sectionToAdd.schedules) {
                if (overlaps(scheduledSchedule, scheduleToAdd)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Recursive helper function to generate all possible schedules
function generateSchedulesHelper(courses, index, currentSchedule, schedules) {
    if (index === courses.length) {
        schedules.push(currentSchedule.map(item => ({ ...item })));
        return;
    }

    const currentCourse = courses[index];

    for (const section of currentCourse.sections) {
        if (!hasConflict(currentSchedule, section)) {
            const scheduleItem = {
                courseId: currentCourse.id,
                courseName: currentCourse.name,
                section: { ...section }
            };

            currentSchedule.push(scheduleItem);
            generateSchedulesHelper(courses, index + 1, currentSchedule, schedules);
            currentSchedule.pop(); // Make sure this is correctly removing the last added section
        }
    }
}

// Main function to generate all schedules
function generateAllSchedules(courses) {
    const schedules = [];
    const currentSchedule = [];

    generateSchedulesHelper(courses, 0, currentSchedule, schedules);

    return schedules;
}

module.exports = {
    generateAllSchedules,
    generateSchedulesHelper,
    hasConflict,
    overlaps,
};
