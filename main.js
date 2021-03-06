var date = new Date();

var monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var dayNames = ["S", "M", "T", "W", "T", "F", "S"];

var currentYear = date.getFullYear();

var cssSheet = document.getElementsByTagName("style")[0].sheet;

var calendarData = {};
calendarData[currentYear] = { colors: {}, text: {} };

// screw leap years
function leapYear(yearToCheck) {
    return (!(yearToCheck % 4) && (yearToCheck % 100) || !(yearToCheck % 400)) ? 1 : 0;
}

// populates the calendar div with a calendar
function generateYear(year) {
    var h2 = document.createElement("h2");
    h2.innerText = year;
    calendar.appendChild(h2);
    for (var i = 0; i < monthDays.length; i++) {
        calendar.appendChild(generateMonth(i, year));
    }
    if (calendarData[year] === undefined) {
        calendarData[year] = { colors: {}, text: {} };
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
        td.className = "header";
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
        td.id = `${year}.${month}.${j + 1}`;
        td.className = "day";
        td.onclick = function () {
            if (selectedColor === "#ffffff") {
                if (this.childElementCount === 0) {
                    addMessage(this, "");
                }
            } else {
                if (selectedIndex === 0) {
                    this.style.backgroundColor = selectedColor;
                    delete calendarData[currentYear].colors[this.id];
                    if (this.childElementCount === 2) {
                        this.removeChild(this.lastElementChild);
                        this.removeChild(this.lastElementChild);
                        delete calendarData[currentYear].text[this.id];
                    }
                } else if (selectedIndex > 0) {
                    this.style.backgroundColor = selectedColor;
                    calendarData[currentYear].colors[this.id] = selectedIndex;
                }
            }
        };
        row.appendChild(td);

        // blank cells at end and append last row
        if (j + 1 === days) {
            addCells(6 - dayIndex, row);
            table.appendChild(row);
        }
    }

    div.appendChild(table);

    return div;
}

function addMessage(parent, text) {
    var expandButton = document.createElement("button");
    expandButton.innerText = "≡";
    expandButton.style = "padding: 0;width: 15px;";
    expandButton.onclick = function () {
        this.parentElement.children[1].style.display = "block";
    };

    var div = document.createElement("div");
    div.style = `position: absolute;left: ${parent.clientX}px;top: ${parent.clientY}px;display: none`;
    div.className = "text";

    var contractButton = document.createElement("button");
    contractButton.innerText = "–";
    contractButton.onclick = function () {
        this.parentElement.style.display = "none";
    };
    div.appendChild(contractButton);

    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.className = "dayText";
    div.appendChild(textarea);

    parent.appendChild(expandButton);

    parent.appendChild(div);

    parent.style.padding = "0";
}

function addCells(amount, element) {
    for (var k = 0; k < amount; k++) {
        var td = document.createElement("td");
        element.appendChild(td);
    }
}

// goes to previous year
function previous() {
    saveYearText();
    calendar.innerHTML = "";
    generateYear(--currentYear);
    loadFromCalendarData();
}

// goes to next year
function next() {
    saveYearText();
    calendar.innerHTML = "";
    generateYear(++currentYear);
    loadFromCalendarData();
}

function save() {
    saveYearText();
    localStorage.calendarData = lzw_encode(JSON.stringify(calendarData));
}

function saveYearText() {
    var texts = document.getElementsByClassName("dayText");
    for (var i = 0; i < texts.length; i++) {
        calendarData[currentYear].text[texts[i].parentElement.parentElement.id] = texts[i].value;
    }
}

function exportSave() {
    var textarea = document.createElement("textarea");
    textarea.onclick = function () {
        this.focus();
        this.select();
    };
    textarea.value = lzw_encode(JSON.stringify(calendarData));
    document.getElementById("save").innerHTML = "";
    document.getElementById("save").appendChild(textarea);
}

function importSave() {
    var textarea = document.createElement("textarea");
    textarea.id = "import";
    var button = document.createElement("button");
    button.innerText = "load";
    button.onclick = function() {
        calendarData = JSON.parse(lzw_decode(document.getElementById("import").value));
        loadFromCalendarData();
        document.getElementById("save").innerHTML = "";
    }

    document.getElementById("save").innerHTML = "";
    document.getElementById("save").appendChild(textarea);
    document.getElementById("save").appendChild(button);
}

// select text tool
function text() {
    selectedColor = "#ffffff";
    cursor.style.display = "block";
    cursor.style.backgroundColor = "#ffffff";
    cssSheet.deleteRule(cssSheet.cssRules.length - 1);
    cssSheet.insertRule(`.day:hover{background-color:#555555;cursor: pointer;}`, cssSheet.cssRules.length);
}

var colors = ["", "#801a11", "#9ea112", "#1c8c0d", "#0d868c", "#200d80", "#790c7a"];
var selectedColor;
var selectedIndex;

function generateColorButtons() {
    var button = document.createElement("button");
    button.style.backgroundColor = colors[0];
    button.colorID = 0;
    button.innerText = "X";
    button.onclick = function () {
        changeDayCSS(`.day:hover{background-color:${colors[this.colorID]};cursor: not-allowed;}`);
        selectedColor = colors[this.colorID];
        selectedIndex = this.colorID;
        cursor.style.display = "none";
    };
    buttons.appendChild(button);

    for (var i = 1; i < colors.length; i++) {
        var button = document.createElement("button");
        button.style.backgroundColor = colors[i];
        button.colorID = i;
        button.style.width = "20px";
        button.style.height = "20px";
        button.onclick = function () {
            changeDayCSS(`.day:hover{background-color:${colors[this.colorID]};cursor: pointer;}`);
            selectedColor = colors[this.colorID];
            selectedIndex = this.colorID;
            cursor.style.display = "block";
            cursor.style.backgroundColor = colors[this.colorID];
        };
        buttons.appendChild(button);
    }
}

function changeDayCSS(css) {
    cssSheet.deleteRule(cssSheet.cssRules.length - 1);
    cssSheet.insertRule(css, cssSheet.cssRules.length);
}

// cursor
document.body.addEventListener("mousemove", (e) => {
    cursor.style.top = e.clientY - 5 + "px";
    cursor.style.left = e.clientX - 5 + "px";
});

document.body.addEventListener("keydown", (e) => {
    if (e.keyCode === 27) {
        selectedColor = "";
        selectedIndex = -1;
        cursor.style.display = "none";
        changeDayCSS(`.day:hover{background-color:#252525;}`);
        [].map.call(document.getElementsByClassName("text"), (e) => (e.style.display = "none"));
    }
});

generateColorButtons();
generateYear(currentYear);

if (localStorage.calendarData === undefined) {
    calendarData = {};
    calendarData[currentYear] = { colors: {}, text: {} };
} else {
    calendarData = JSON.parse(lzw_decode(localStorage.calendarData));
    loadFromCalendarData();
}

function loadFromCalendarData() {
    var yearColors = calendarData[currentYear].colors;
    var colorKeys = Object.keys(yearColors);
    for (var i = 0; i < colorKeys.length; i++) {
        document.getElementById(colorKeys[i]).style.backgroundColor = colors[yearColors[colorKeys[i]]];
    }

    var yearText = calendarData[currentYear].text;
    var textKeys = Object.keys(yearText);
    for (var i = 0; i < textKeys.length; i++) {
        addMessage(document.getElementById(textKeys[i]), yearText[textKeys[i]]);
    }
    
}

// https://stackoverflow.com/questions/294297/javascript-implementation-of-gzip
// LZW-compress a string
function lzw_encode(s) {
    var dict = {};
    var data = (s + "").split("");
    var out = [];
    var currChar;
    var phrase = data[0];
    var code = 256;
    for (var i = 1; i < data.length; i++) {
        currChar = data[i];
        if (dict[phrase + currChar] != null) {
            phrase += currChar;
        } else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase = currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var i = 0; i < out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }
    return out.join("");
}

// Decompress an LZW-encoded string
function lzw_decode(s) {
    var dict = {};
    var data = (s + "").split("");
    var currChar = data[0];
    var oldPhrase = currChar;
    var out = [currChar];
    var code = 256;
    var phrase;
    for (var i = 1; i < data.length; i++) {
        var currCode = data[i].charCodeAt(0);
        if (currCode < 256) {
            phrase = data[i];
        } else {
            phrase = dict[currCode] ? dict[currCode] : oldPhrase + currChar;
        }
        out.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
    }
    return out.join("");
}
