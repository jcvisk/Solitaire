(() => {
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
    (()=> {
        for (let i = 0; i < columnsDivs.length; i++) {
            for (let j = 0; j < i + 1; j++) {
                const carta = mazo.pop();

                createImgCard(carta, false, i, j);
            }
        }
    })();

    
    function pedirCarta() {
        if (mazo.length > 0) {
            const carta = mazo.pop();

            mazoAux.push(carta);

            createImgCard(carta, true);

            if (mazo.length == 0) {
                newCardButton.src = "assets/cartas/empty.png";
                newCardButton.alt = "empty card";
            }
        } else {
            mazo = [...mazoAux.reverse()];
            mazoAux = [];
            if (mazo.length !== 0) {
                newCardButton.src = "assets/cartas/red_back.png";
                newCardButton.alt = "card back";
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
                img.classList.add("last-card");
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
            }
        }
    }

    function eliminarDelMazo(uuid) {
        let index = mazoAux.findIndex(obj => obj.uuid === uuid);
        mazoAux.splice(index, 1);
    }

    function validaMovimiento(column, cartaSoltada, cartaOrigen, columnaActual, uuid, columnsPalos) {
        const lastCard = column.lastElementChild;
        if (!columnsPalos) {
            if (!lastCard) {
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
        } else {
            if (!lastCard) {
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
        }

        // eliminando la carta del mazo de donde venga en HTML
        cartaSoltada.parentElement.removeChild(cartaSoltada, cartaSoltada);

        if (cartaOrigen === "mazoVisibleDiv") {
            eliminarDelMazo(uuid)
        }

        // agregando la carta a la columna
        column.appendChild(cartaSoltada);
        column.classList.remove("drag-over");

        voltearCarta(columnaActual);
    }

    //Listeners
    newCardButton.addEventListener('click', () => {
        pedirCarta();
    });

    mazoVisibleDiv.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", e.target.getAttribute("uuid"));
        e.target.setAttribute("data-origin", "mazoVisibleDiv");
    });

    columnsDivs.forEach((column) => {

        column.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", e.target.getAttribute("uuid"));
            e.target.setAttribute("data-origin", "column");
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
            const uuid = e.dataTransfer.getData("text/plain");
            const cartaSoltada = document.querySelector(`img[uuid="${uuid}"]`);
            const cartaOrigen = cartaSoltada.getAttribute("data-origin");
            const columnaActual = cartaSoltada.parentElement;

            validaMovimiento(column, cartaSoltada, cartaOrigen, columnaActual, uuid, false);
        });
    });

    columnsPalos.forEach((column) => {

        column.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", e.target.getAttribute("uuid"));
            e.target.setAttribute("data-origin", "column");
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
            const uuid = e.dataTransfer.getData("text/plain");
            const cartaSoltada = document.querySelector(`img[uuid="${uuid}"]`);
            const cartaOrigen = cartaSoltada.getAttribute("data-origin");
            const columnaActual = cartaSoltada.parentElement;

            validaMovimiento(column, cartaSoltada, cartaOrigen, columnaActual, uuid, true);
        });
    });
})();