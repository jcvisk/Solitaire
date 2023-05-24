const timer = document.getElementById("timer");
// Inicializamos el contador de tiempo
let seconds = 0;
let minutes = 0;
let hours = 0;
let timerInterval; // Variable para almacenar el intervalo del temporizador
// Actualizamos el contador de tiempo cada segundo
function initTimer() {
    timerInterval = setInterval(() => {
        seconds++;

        if (seconds >= 60) {
            seconds = 0;
            minutes++;

            if (minutes >= 60) {
                minutes = 0;
                hours++;
            }
        }

        // Formateamos el tiempo para mostrarlo en el HTML
        const time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

        // Actualizamos el HTML con el tiempo actualizado
        timer.innerHTML = time;
    }, 1000);
}

function pauseTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    clearInterval(timerInterval);
    seconds = 0;
    minutes = 0;
    hours = 0;
    timer.innerHTML = "00:00:00";
}

function resumeTimer() {
    initTimer();
}

export {initTimer, pauseTimer, resetTimer, resumeTimer};