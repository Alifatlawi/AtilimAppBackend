

function generateAllSchedules(courses) {
    const schedules = [];
    const currentSchedule = [];

    // Start generating schedules
    generateSchedulesHelper(courses, 0, currentSchedule, schedules);

    return schedules;
}

function generateSchedulesHelper(courses, index, currentSchedule, schedules) {
    if (index === courses.length) {
        // Clone the currentSchedule to avoid reference issues
        schedules.push(currentSchedule.map(item => ({ ...item })));
        return;
    }

    const currentCourse = courses[index];

    for (const section of currentCourse.sections) {
        if (!hasConflict(currentSchedule, section)) {
            // Include course ID and name with the section
            const scheduleItem = {
                courseId: currentCourse.id,
                courseName: currentCourse.name,
                section: { ...section } // Clone the section to avoid reference issues
            };

            currentSchedule.push(scheduleItem);
            generateSchedulesHelper(courses, index + 1, currentSchedule, schedules);
            currentSchedule.pop();
        }
    }
}


function hasConflict(schedule, sectionToAdd) {
    for (const item of schedule) {
        const scheduledSection = item.section; // Get the section from the schedule item

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

    // Get the English day names
    const s1Day = turkishToEnglishDays[s1.day];
    const s2Day = turkishToEnglishDays[s2.day];

    // Assuming the times are strings in the format "HH:MM"
    const s1Start = new Date(`1970-01-01T${s1.startTime}:00Z`);
    const s1End = new Date(`1970-01-01T${s1.endTime}:00Z`);
    const s2Start = new Date(`1970-01-01T${s2.startTime}:00Z`);
    const s2End = new Date(`1970-01-01T${s2.endTime}:00Z`);

    // Check for both day and time overlaps
    return s1Day === s2Day && s1Start < s2End && s2Start < s1End;
}


module.exports = {
    generateAllSchedules,
    generateSchedulesHelper,
    hasConflict,
    overlaps,
};