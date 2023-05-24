import Carta from "./Carta.js";
import { shuffle, shuffleExpertLevel } from "./mixer.js";
import {initTimer, pauseTimer, resetTimer, resumeTimer} from "./timer.js";

(() => {
    //elementsHTML
    const btnReproducir = document.getElementById('reproducir');
    const cerrarModal = document.getElementById('cerrarModal');
    const showOptionsModal = document.getElementById('showOptionsModal');
    const newCardButton = document.getElementById('newCard');
    const mazoVisibleDiv = document.getElementById('mazoVisible');
    const columnsDivs = document.querySelectorAll('.columns');
    const columnsPalos = document.querySelectorAll('.palos');
    const points = document.getElementById("points");

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
        for (let i = 0; i < columnsDivs.length; i++) {
            for (let j = 0; j < i + 1; j++) {
                const carta = mazo.pop();

                createImgCard(carta, false, i, j);
            }
        }
    };


    function pedirCarta() {
        if (!timerInicializado) {
            initTimer();
            timerInicializado = !timerInicializado;
        }

        if (mazo.length > 0) {
            const carta = mazo.pop();

            mazoAux.push(carta);

            createImgCard(carta, true);

            if (mazo.length == 0) {
                newCardButton.src = "assets/cartas/empty.png";
                newCardButton.alt = "empty card";
            }
            playSound('flipcard');
        } else {

            mazo = [...mazoAux.reverse()];
            mazoAux = [];
            if (mazo.length !== 0) {
                newCardButton.src = "assets/cartas/red_back.png";
                newCardButton.alt = "card back";

                playSound('shuffle');
            } else {
                playSound('empty');
            }
            mazoVisibleDiv.innerHTML = "";

        }
    }

    function createImgCard(carta, fromDeck, i, j) {
        const img = document.createElement("img");
        img.alt = "card";
        img.classList.add("img-fluid");
        img.setAttribute("uuid", carta.uuid);

        if (fromDeck) {
            img.src = `assets/cartas/${carta.numero}${carta.palo}.png`;
            mazoVisibleDiv.appendChild(img);
        } else {

            img.src = `assets/cartas/red_back.png`;
            img.setAttribute("show", false);

            if (j == i) {
                img.src = `assets/cartas/${carta.numero}${carta.palo}.png`;
                img.setAttribute("show", true);
            }

            columnsDivs[i].appendChild(img);
        }
    }

    const limpiarTablero = () => {
        //se recetean los mazos
        mazo = [];
        mazoAux = [];
        mazoResp = [];
        //se recetean las columnas
        mazoVisibleDiv.innerHTML = "";
        columnsDivs.forEach((column) => {
            column.innerHTML = "";
        });
        columnsPalos.forEach((column) => {
            column.innerHTML = "";
        });
        //se recetea el timer
        resetTimer();
        timerInicializado = false;
        //se recetea el puntaje
        puntaje = 0;
        points.innerHTML = puntaje;

        newCardButton.src = "assets/cartas/red_back.png";
        newCardButton.alt = "card back";
    }

    function getUrlImg(uuid) {
        const carta = mazoResp.find(carta => carta.uuid === uuid);
        return `assets/cartas/${carta.numero}${carta.palo}.png`;
    }

    function getColor(uuid) {
        const carta = mazoResp.find(carta => carta.uuid === uuid);
        return carta.color;
    }

    function getValue(uuid) {
        const carta = mazoResp.find(carta => carta.uuid === uuid);
        return VALORES[carta.numero] || +carta.numero;
    }

    function getPalo(uuid) {
        const carta = mazoResp.find(carta => carta.uuid === uuid);
        return carta.palo;
    }

    function voltearCarta(columnaActual) {
        const cartasDeColumna = columnaActual.querySelectorAll("img");
        if (cartasDeColumna.length > 0) {
            const ultimaCarta = cartasDeColumna[cartasDeColumna.length - 1];
            if (ultimaCarta.getAttribute("show") === "false") {
                ultimaCarta.setAttribute("src", getUrlImg(ultimaCarta.getAttribute("uuid")));
                ultimaCarta.setAttribute("show", "true");
                setPuntos('+', 5);
            }
        }
    }

    function eliminarDelMazo(uuid) {
        let index = mazoAux.findIndex(obj => obj.uuid === uuid);
        mazoAux.splice(index, 1);
    }

    function validaMovimiento(column, cartasSoltadas, cartaOrigen, columnaActual, columnsPalos) {
        if (!timerInicializado) {
            initTimer();
            timerInicializado = !timerInicializado;
        }

        let lastCard = column.lastElementChild;
        if (!columnsPalos) {
            for (const cartaSoltada of cartasSoltadas) {
                if (!lastCard) {//En la columna vacía solo se puede agregar un K
                    const cardSrc = cartaSoltada.getAttribute("src");
                    const cardName = cardSrc.substring(cardSrc.length - 6);
                    if (!cardName.includes('K')) return;
                } else {
                    const lastCardColor = getColor(lastCard.getAttribute("uuid"));
                    const cartaSoltadaColor = getColor(cartaSoltada.getAttribute("uuid"));
                    if (lastCardColor === cartaSoltadaColor) return;
                    const lastCardValue = getValue(lastCard.getAttribute("uuid"));
                    const cartaSoltadaValue = getValue(cartaSoltada.getAttribute("uuid"));
                    if (cartaSoltadaValue !== lastCardValue - 1) return;
                }

                if (cartaOrigen === "columnPalos") setPuntos('-', 10);

                deleteAndAddCard(column, cartaSoltada, cartaOrigen);
                voltearCarta(columnaActual);
                lastCard = cartaSoltada;
            }
        } else {
            for (const cartaSoltada of cartasSoltadas) {
                if (!lastCard) {//En la columna vacía solo se puede agregar un A
                    const cartaSoltadaValue = getValue(cartaSoltada.getAttribute("uuid"));
                    if (cartaSoltadaValue !== 1) return;
                } else {
                    const lastCardPalo = getPalo(lastCard.getAttribute("uuid"));
                    const cartaSoltadaPalo = getPalo(cartaSoltada.getAttribute("uuid"));
                    if (lastCardPalo !== cartaSoltadaPalo) return;
                    const lastCardValue = getValue(lastCard.getAttribute("uuid"));
                    const cartaSoltadaValue = getValue(cartaSoltada.getAttribute("uuid"));
                    if (cartaSoltadaValue !== lastCardValue + 1) return;
                }
                if (cartaOrigen !== "columnPalos") {
                    cartaOrigen === "mazoVisibleDiv" ? setPuntos('+', 5) : setPuntos('+', 10);
                }

                deleteAndAddCard(column, cartaSoltada, cartaOrigen);
                voltearCarta(columnaActual);
            }
        }

        playSound('movecard');
    }

    function deleteAndAddCard(column, cartaSoltada, cartaOrigen) {
        // eliminando la carta del mazo de donde venga en HTML
        cartaSoltada.parentElement.removeChild(cartaSoltada, cartaSoltada);

        if (cartaOrigen === "mazoVisibleDiv") {
            setPuntos('+', 5);
            eliminarDelMazo(cartaSoltada.getAttribute("uuid"));
        }

        // agregando la carta a la columna
        column.appendChild(cartaSoltada);
        column.classList.contains("columns") ? cartaSoltada.setAttribute("data-origin", "column") : cartaSoltada.setAttribute("data-origin", "columnPalos");
        column.classList.remove("drag-over");
    }

    //Listeners

    btnReproducir.addEventListener('click', () => {
        const inputs = document.querySelectorAll('input[name="difficultyOption"]');
        inputs.forEach((input) => {
            if (input.checked) {
                limpiarTablero();

                mazo = crearMazo(input.value);
                mazoResp = [...mazo];
                llenarColumnas();

                cerrarModal.click();
            }
        });
    });

    newCardButton.addEventListener('click', () => {
        pedirCarta();
    });

    mazoVisibleDiv.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", JSON.stringify([e.target.getAttribute("uuid")]));
        e.target.setAttribute("data-origin", "mazoVisibleDiv");
    });

    columnsDivs.forEach((column) => {

        column.addEventListener("dragstart", (e) => {
            let uuids = [];
            e.target.setAttribute("data-origin", "column");
            let nextImg = e.target.nextElementSibling;

            if (nextImg) uuids.push(e.target.getAttribute("uuid"));

            while (nextImg) {
                nextImg.setAttribute("data-origin", "column");
                uuids.push(nextImg.getAttribute("uuid"));

                nextImg = nextImg.nextElementSibling;
            }

            e.dataTransfer.setData("text/plain", uuids.length > 0 ? JSON.stringify(uuids) : JSON.stringify([e.target.getAttribute("uuid")]));

        });

        column.addEventListener("dragover", (e) => {
            e.preventDefault();
            column.lastElementChild ? column.lastElementChild.classList.add("drag-over") : column.classList.add("drag-over");
        });

        column.addEventListener("dragenter", (e) => {
            column.lastElementChild ? column.lastElementChild.classList.add("drag-over") : column.classList.add("drag-over");
        });

        column.addEventListener("dragleave", (e) => {
            column.lastElementChild ? column.lastElementChild.classList.remove("drag-over") : column.classList.remove("drag-over");
        });

        column.addEventListener("drop", (e) => {
            e.preventDefault();
            column.lastElementChild ? column.lastElementChild.classList.remove("drag-over") : column.classList.remove("drag-over");
            const uuids = JSON.parse(e.dataTransfer.getData("text/plain"));
            const cartasSoltadas = Array.from(document.querySelectorAll(`img[uuid|="${uuids.join('"],[uuid|="')}"]`));
            const cartaOrigen = cartasSoltadas[0].getAttribute("data-origin");
            //columna origen; de donde vienen las cartas
            const columnaActual = cartasSoltadas[0].parentElement;

            if (cartasSoltadas[0].getAttribute("show") !== "false") {
                validaMovimiento(column, cartasSoltadas, cartaOrigen, columnaActual, false);
            }
        });
    });

    columnsPalos.forEach((column) => {

        column.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", JSON.stringify([e.target.getAttribute("uuid")]));
            e.target.setAttribute("data-origin", "columnPalos");
        });

        column.addEventListener("dragover", (e) => {
            e.preventDefault();
            column.classList.add("drag-over");
        });

        column.addEventListener("dragenter", (e) => {
            column.classList.add("drag-over");
        });

        column.addEventListener("dragleave", (e) => {
            column.classList.remove("drag-over");
        });

        column.addEventListener("drop", (e) => {
            e.preventDefault();
            column.classList.remove("drag-over");
            const uuids = JSON.parse(e.dataTransfer.getData("text/plain"));
            const cartasSoltadas = Array.from(document.querySelectorAll(`img[uuid|="${uuids.join('"],[uuid|="')}"]`));
            const cartaOrigen = cartasSoltadas[0].getAttribute("data-origin");
            //columna origen; de donde vienen las cartas
            const columnaActual = cartasSoltadas[0].parentElement;

            if (cartasSoltadas[0].getAttribute("show") !== "false") {
                validaMovimiento(column, cartasSoltadas, cartaOrigen, columnaActual, true);
            }
        });
    });
})();