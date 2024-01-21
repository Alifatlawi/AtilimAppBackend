

function generateAllSchedules(courses) {
    const schedules = [];
    const currentSchedule = [];

    // Start generating schedules
    generateSchedulesHelper(courses, 0, currentSchedule, schedules);

    return schedules;
}

function generateSchedulesHelper(courses, index, currentSchedule, schedules) {
    // If we have processed all courses, add the current schedule to the list
    if (index === courses.length) {
        schedules.push([...currentSchedule]);
        return;
    }

    const currentCourse = courses[index];

    // Try each section of the current course
    for (const section of currentCourse.sections) {
        // Check for time conflicts with the current schedule
        if (!hasConflict(currentSchedule, section)) {
            currentSchedule.push(section);
            generateSchedulesHelper(courses, index + 1, currentSchedule, schedules);
            currentSchedule.pop();
        }
    }
}

function hasConflict(schedule, section) {
    for (const scheduledSection of schedule) {
        for (const scheduledSchedule of scheduledSection.schedules) {
            for (const schedule of section.schedules) {
                if (overlaps(scheduledSchedule, schedule)) {
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