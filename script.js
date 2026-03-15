const params = [
    {
        "name": "speed",
        "min": 0,
        "max": 25,
        "normal": [5, 15]
    },
    {
        "name": "rpm",
        "min": 0,
        "max": 20,
        "normal": [8, 18]
    },
    {
        "name": "power",
        "min": 0,
        "max": 2000,
        "normal": [500, 1800]
    },
    {
        "name": "angle",
        "min": 0,
        "max": 90,
        "normal": [10, 45]
    },
    {
        "name": "wind-angle"
    }
]
const plstopbtn = document.getElementById("PLAYSTOP");
const lastUpdateTime = document.getElementById("LASTU")
const timeDisplay = document.getElementById("TIME");
const statusU = document.getElementById("status5");

let isRunning = false;
let seconds = 0;
let timerInterval = null;
let updateInterval = null;

plstopbtn.style.backgroundColor = "green";

function playstop() {
    if (!isRunning) {
        plstopbtn.style.backgroundColor = "red";
        plstopbtn.innerHTML = '<i class="bi bi-stop-fill"></i> Зупинити';
        isRunning = true;
        timerInterval = setInterval(updateTimer, 1000);
        update()
        updateInterval = setInterval(update, 10000);
    }
    else {
        isRunning = false;
        plstopbtn.style.backgroundColor = "green";
        plstopbtn.innerHTML = `<i class="bi bi-play-fill"></i> Почати`;
        seconds = 0;
        timeDisplay.innerText = "00:00:00";
        clearInterval(timerInterval);
        clearInterval(updateInterval);
        document.getElementById("status5").innerText = "Система вимкнута.";
        document.getElementById("status5").style.color = "black";
    }
}

function updateTimer() {
    seconds++;

    let hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = seconds % 60;

    let displayHrs = hrs < 10 ? "0" + hrs : hrs;
    let displayMins = mins < 10 ? "0" + mins : mins;
    let displaySecs = secs < 10 ? "0" + secs : secs;

    timeDisplay.innerText = `${displayHrs}:${displayMins}:${displaySecs}`;
}

function getRandom(min, max, decimals = 1) {
    return (Math.random() * (max - min) + min).toFixed(decimals);
}



function getStatusColor(param, value) {
    if (value >= param.normal[0] && value <= param.normal[1]) return "green";
    else if (value >= param.min && value <= param.max) return "orange";
    return "red";
}

const ctx = document.getElementById('powerChart').getContext('2d');
const powerChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Потужність (кВт)',
            data: [],
            borderColor: 'blue',
            tension: 0.4,
            fill: true
        }]
    },
    options: { responsive: true, maintainAspectRatio: false }
});

function update() {
    if (!isRunning) {
        statusU.classList.add("shake");
        setTimeout(() => statusU.classList.remove("shake"), 400);
        return; 
    }

    let now = new Date();
    let hours = String(now.getHours()).padStart(2, '0');
    let minutes = String(now.getMinutes()).padStart(2, '0');
    lastUpdateTime.innerText = hours + ":" + minutes;
    params.forEach((param, idx) => {
        if (param.name != "wind-angle") {
            const value = getRandom(param.min, param.max)
            const status = getStatusColor(param, value);
            document.getElementById("number" + String(idx + 1)).innerHTML = value;
            document.getElementById("status" + String(idx + 1)).style.color = status;
            if (param.name == "power") updatePower(value);
        }
        else {
            let value = getRandom(0, 360);
            document.getElementById("number5").innerText = value;
            document.getElementById("wind-angle").style.transform = `rotate(${value}deg)`;

            value = parseFloat(document.getElementById("number1").textContent)
            if (value > params[0].normal[1]) {
                statusU.innerText = "Швидкість вітру зашвидка.";
                statusU.style.color = "orange";
            }
            else {
                statusU.innerText = "Стан стабільний.";
                statusU.style.color = "black";
            }
        }
    })
}

function updatePower(value){
    const now = new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    powerChart.data.labels.push(now);
    powerChart.data.datasets[0].data.push(value);


    if (powerChart.data.labels.length > 10) {
        powerChart.data.labels.shift();
        powerChart.data.datasets[0].data.shift();
    }

    powerChart.update();
}

update();