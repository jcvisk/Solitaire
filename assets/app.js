//(() => {
    const uuidv4 = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    
    class Carta {
        constructor(numero, palo) {
            this.numero = numero;
            this.palo = palo;
            this.uuid = uuidv4();
            this.color = palo === 'S' || palo === 'C' ? 'N' : 'R';
        }
    }

    //elementsHTML
    const newCardButton = document.getElementById('newCard');
    const mazoVisibleDiv = document.getElementById('mazoVisible');
    const columnsDivs = document.querySelectorAll('.columns');
    const columnsPalos = document.querySelectorAll('.palos');
    const timer = document.getElementById("timer");
    const points = document.getElementById("points");

    let timerInicializado = false;

    // Inicializamos el contador de tiempo
    let seconds = 0;
    let minutes = 0;
    let hours = 0;
    // Actualizamos el contador de tiempo cada segundo
    function initTimer() {
        setInterval(() => {
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

    const crearMazo = () => {
        const mazo = [];
        const palos = ['C', 'D', 'H', 'S'];
        const numeros = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        for (let palo of palos) {
            for (let numero of numeros) {
                mazo.push(new Carta(numero, palo));
            }
        }
        //mezclo el mazo
        for (let i = mazo.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
        }
        return mazo;
    }

    let mazo = crearMazo();
    let mazoAux = [];
    let mazoResp = [...mazo];

    /**
     * Función anonima que llena las columnas
     */
    (() => {
        for (let i = 0; i < columnsDivs.length; i++) {
            for (let j = 0; j < i + 1; j++) {
                const carta = mazo.pop();

                createImgCard(carta, false, i, j);
            }
        }
    })();


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
            }else{
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

    function validaMovimiento(column, cartasSoltadas, cartaOrigen, columnaActual, uuid, columnsPalos) {
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

                deleteAndAddCard(column, cartaSoltada, cartaOrigen, uuid);
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
                cartaOrigen === "mazoVisibleDiv" ? setPuntos('+', 5) : setPuntos('+', 10);
                deleteAndAddCard(column, cartaSoltada, cartaOrigen, uuid);
                voltearCarta(columnaActual);
            }
        }

        playSound('movecard');
    }

    function deleteAndAddCard(column, cartaSoltada, cartaOrigen, uuid) {
        // eliminando la carta del mazo de donde venga en HTML
        cartaSoltada.parentElement.removeChild(cartaSoltada, cartaSoltada);

        if (cartaOrigen === "mazoVisibleDiv") {
            console.log('elimina a: '+uuid);
            setPuntos('+', 5);
            eliminarDelMazo(uuid);
        }

        // agregando la carta a la columna
        column.appendChild(cartaSoltada);
        column.classList.remove("drag-over");
    }

    //Listeners
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
            const uuids = JSON.parse(e.dataTransfer.getData("text/plain"));
            const cartasSoltadas = Array.from(document.querySelectorAll(`img[uuid|="${uuids.join('"],[uuid|="')}"]`));
            const cartaOrigen = cartasSoltadas[0].getAttribute("data-origin");
            //columna origen; de donde vienen las cartas
            const columnaActual = cartasSoltadas[0].parentElement;

            if (cartasSoltadas[0].getAttribute("show") !== "false") {
                validaMovimiento(column, cartasSoltadas, cartaOrigen, columnaActual, uuids, false);
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
            const uuids = JSON.parse(e.dataTransfer.getData("text/plain"));
            const cartasSoltadas = Array.from(document.querySelectorAll(`img[uuid|="${uuids.join('"],[uuid|="')}"]`));
            const cartaOrigen = cartasSoltadas[0].getAttribute("data-origin");
            //columna origen; de donde vienen las cartas
            const columnaActual = cartasSoltadas[0].parentElement;

            if (cartasSoltadas[0].getAttribute("show") !== "false") {
                validaMovimiento(column, cartasSoltadas, cartaOrigen, columnaActual, uuids, true);
            }
        });
    });
//})();