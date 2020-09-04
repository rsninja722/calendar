var date = new Date();

var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var dayNames = ["S", "M", "T", "W", "T", "F", "S"];

var currentYear = date.getFullYear();

// screw leap years
function leapYear(yearToCheck) {
    return (!(yearToCheck % 4) && !!(yearToCheck % 100)) || !(yearToCheck % 400) ? 1 : 0;
}

// populates the calendar div with a calendar
function generateYear(year) {
    var h2 = document.createElement("h2");
    h2.innerText = year;
    calendar.appendChild(h2);
    for (var i = 0; i < monthDays.length; i++) {
        calendar.appendChild(generateMonth(i, year));
    }
}

// generates a table for a month of a year
function generateMonth(month, year) {
    var div = document.createElement("div");
    div.className = "month";

    // month name
    div.innerText = monthNames[month];

    var table = document.createElement("table");

    // days header
    var row = document.createElement("tr");
    for (var j = 0; j < 7; j++) {
        var td = document.createElement("td");
        td.innerText = dayNames[j];
        row.appendChild(td);
    }
    table.appendChild(row);

    // days
    row = document.createElement("tr");

    // amount of months in day
    var days = monthDays[month] + (month === 1 ? leapYear(year) : 0);

    // day of the week to start at
    var startDate = new Date(`${monthNames[month]} 1, ${year} 00:00:01`);
    var startDateIndex = startDate.getDay();

    // generate cells with date numbers
    for (var j = 0; j < days; j++) {
        // day of the week
        var dayIndex = (startDateIndex + j) % 7;

        // blank cells at start
        if (j === 0) {
            addCells(dayIndex, row);
        }

        // make a new row when needed
        if (j > 0 && dayIndex === 0) {
            table.appendChild(row);
            row = document.createElement("tr");
        }

        // make cell
        var td = document.createElement("td");
        td.innerText = j + 1;
        row.appendChild(td);

        // blank cells at end and append last row
        if (j + 1 === days) {
            addCells(7 - dayIndex, row);
            table.appendChild(row);
        }
    }

    div.appendChild(table);

    return div;
}

function addCells(amount, element) {
    for (var k = 0; k < amount; k++) {
        var td = document.createElement("td");
        element.appendChild(td);
    }
}

// goes to previous year
function previous() {
    calendar.innerHTML = "";
    generateYear(--currentYear);
}

// goes to next year
function next() {
    calendar.innerHTML = "";
    generateYear(++currentYear);
}

generateYear(currentYear);
