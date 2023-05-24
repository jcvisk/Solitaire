import Carta from "./Carta.js";
import { shuffle, shuffleExpertLevel } from "./mixer.js";
import { initTimer, pauseTimer, resetTimer, resumeTimer } from "./timer.js";

//elementsHTML
const newCardButton = document.getElementById('newCard');
const btnReproducir = document.getElementById('reproducir');
const cerrarModal = document.getElementById('cerrarModal');
const showOptionsModal = document.getElementById('showOptionsModal');
const nivelesDivs = document.querySelectorAll('.nivel');
const takeCard = document.querySelector('.take-card');
const cardContent = document.querySelector('.card-content');

(() => {
    showOptionsModal.click();
})();

let mazo = [];
let mazoAux = [];
let mazoResp = [];

let timerInicializado = false;

//Funcion para los sonidos
function playSound(id) {
    const audio = document.getElementById(id)
    if (!audio) return;

    audio.currentTime = 0;
    audio.play();
}

//Inicializamos los puntos en cero
let puntaje = 0;
function setPuntos(operation, puntos) {
    puntaje = operation === '+' ? puntaje + puntos : puntaje - puntos;
    points.innerHTML = puntaje.toString();
}

const VALORES = {
    A: 1,
    J: 11,
    Q: 12,
    K: 13
}

const crearMazo = (dificultad) => {
    const mazo = [];
    const palos = ['C', 'D', 'H', 'S'];
    const numeros = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    for (let palo of palos) {
        for (let numero of numeros) {
            mazo.push(new Carta(numero, palo));
        }
    }

    //mezclo el mazo
    switch (dificultad) {
        case '1':
            return shuffle(mazo, 1);
        case '2':
            return shuffle(mazo, 10);
        case '3':
            return shuffle(mazo, 20);
        case '4':
            return shuffleExpertLevel(mazo, 25);
        case '5':
            return shuffleExpertLevel(mazo, 35);
        case '6':
            return shuffleExpertLevel(mazo, 45);
        default:
            alert("ERROR: EL NIVEL SELECCINADO NO EXISTE");
            break;
    }
}

const llenarColumnas = () => {
    for (let i = 0; i < nivelesDivs.length; i++) {
        for (let j = 0; j < i + 1; j++) {
            const carta = mazo.pop();

            createImgCard(carta, false, i);
        }
    }
};

function createImgCard(carta, fromDeck, i) {
    const div = document.createElement('div');
    const img = document.createElement("img");
    img.alt = "card";
    img.classList.add("img-fluid");
    img.setAttribute("uuid", carta.uuid);
    img.src = `assets/cartas/${carta.numero}${carta.palo}.png`;
    div.appendChild(img);
    if (fromDeck) {
        takeCard.appendChild(img);
    } else {
        nivelesDivs[i].appendChild(div);
    }

}

function moverImagen() {
    const ultimaImagen = takeCard.lastElementChild;

    if (ultimaImagen && ultimaImagen.tagName === 'IMG') {
        takeCard.removeChild(ultimaImagen);
        cardContent.appendChild(ultimaImagen);
    }
}

function pedirCarta(init) {
    if (!init) {
        if (!timerInicializado) {
            initTimer();
            timerInicializado = !timerInicializado;
        }
    }

   

    if (mazo.length > 0) {
        moverImagen();
        const carta = mazo.pop();
        mazoAux.push(carta);
        createImgCard(carta, true);

        if (mazo.length == 0) {
            moverImagen();
        }

        playSound('flipcard');
    } else {

        moverImagen();
        mazo = [...mazoAux.reverse()];
        mazoAux = [];
        if (mazo.length !== 0) {
            pedirCarta(true);

            playSound('shuffle');
        } else {
            playSound('empty');
        }
        cardContent.innerHTML = "";
    }
}




//Listeners

btnReproducir.addEventListener('click', () => {
    const inputs = document.querySelectorAll('input[name="difficultyOption"]');
    inputs.forEach((input) => {
        if (input.checked) {
            //limpiarTablero();

            mazo = crearMazo(input.value);
            mazoResp = [...mazo];
            llenarColumnas();
            pedirCarta(true);

            cerrarModal.click();
        }
    });
});

newCardButton.addEventListener('click', function name() {
    pedirCarta(false);
})