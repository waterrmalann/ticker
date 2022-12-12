const e_stopwatchTicker = document.getElementById("stopwatchTicker");
const e_lapTicker = document.getElementById("lapTicker");

const e_lapList = document.getElementById("lapList");
const e_resetButton = document.getElementById("resetButton");
const e_startButton = document.getElementById("startButton");
const e_lapButton = document.getElementById("lapButton");

var timerRunning = false;
var timerPaused = false;
var timerTime = 0;
var timer = null;
var timerFlags = [];

// The exact-to-millisecond precise time calculated from timestamps.
var timerTimePrecise = 0;
// The unix timestamp for when the timer started ticking.
// Is constantly modified and adjusted when paused/resumed so it is never really a true value.
// NOTE: Don't rely on this to get the real time the stopwatch started.
var timerStartTime = 0;
// The unix timestamp for when the timer was paused.
// Used to calculate the time delay and subtract to make sure the time calculations are perfect.
var timerPauseTime = 0;

function reprTime(ms) {
	const d = new Date(Date.UTC(0, 0, 0, 0, 0, 0, ms));
	return `${String(d.getUTCMinutes()).padStart(2, "0")}:${String(
		d.getUTCSeconds()
	).padStart(2, "0")}.${String(Math.round(d.getUTCMilliseconds() / 10)).padStart(2, "0")}`;
}

function startTimer(startFromMs) {
	timer = setInterval(function () {
		e_stopwatchTicker.textContent = reprTime(timerTimePrecise);
		e_lapTicker.textContent = reprTime(timerTimePrecise - timerFlags.at(-1));
		timerTime += 10;

		timerTimePrecise = Date.now() - timerStartTime;
	}, 10);
	timerStartTime = startFromMs;
}

function pauseTimer() {
	timerPauseTime = Date.now();
	timerPaused = true;
	clearInterval(timer);
	timer = null;
}

function resumeTimer() {
	timerPaused = false;

	// Adjust the time to skip the pause -> resume delay.
	// new start time = old start time + difference between pause time and current time
	timerStartTime = timerStartTime + (Date.now() - timerPauseTime);
	startTimer(timerStartTime);

	timerPauseTime = 0;
}

function setFlag() {
	let _flagAt = timerTimePrecise;

	let _span1 = document.createElement("span");
	_span1.textContent = String(timerFlags.length).padStart(2, "0");

	let _span2 = document.createElement("span");
	_span2.textContent = reprTime(_flagAt);

	let _span3 = document.createElement("span");
	_span3.textContent = "+" + reprTime(_flagAt - timerFlags.at(-1));

	let _li = document.createElement("li");
	_li.classList.add("lap__item");
	_li.appendChild(_span1);
	_li.appendChild(_span2);
	_li.appendChild(_span3);
	
	e_lapList.prepend(_li);
	timerFlags.push(_flagAt);
}

e_startButton.addEventListener("click", () => {
	if (timerRunning) {
		if (timerPaused) {
			resumeTimer();
			e_startButton.firstChild.classList.remove("fa-play");
			e_startButton.firstChild.classList.add("fa-pause");
			e_resetButton.disabled = true;
		} else {
			pauseTimer();
			e_startButton.firstChild.classList.remove("fa-pause");
			e_startButton.firstChild.classList.add("fa-play");
			e_resetButton.disabled = false;
		}
	} else {
		timerRunning = true;
		timerTime = 0;
		timerTimePrecise = 0;
		timerFlags.push(0);
		e_startButton.firstChild.classList.remove("fa-play");
		e_startButton.firstChild.classList.add("fa-pause");
		startTimer(Date.now());
		e_resetButton.disabled = true;
	}
});

e_lapButton.addEventListener("click", () => {
	if (timerRunning) {
		setFlag();
	}
});

e_resetButton.addEventListener("click", () => {
	timerPaused = false;
	if (timerRunning) {
		timerRunning = false;
		clearInterval(timer);
	}
	timerTime = 0;
	timerTimePrecise = 0;
	timerFlags = [];
	e_lapList.innerHTML = "";
	e_stopwatchTicker.textContent = reprTime(0);
	e_lapTicker.textContent = reprTime(0);
});