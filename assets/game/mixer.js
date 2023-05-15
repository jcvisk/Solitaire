const shuffle = (mazo, repeticiones = 1) => {
    for (let k = 0; k < repeticiones; k++) {
        for (let i = mazo.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mazo[i], mazo[j]] = [mazo[j], mazo[i]];
        }
    }

    return mazo;
}

const shuffleExpertLevel = (mazo, repeticiones) => {

    const grupoSize = 4; // Tamaño de cada grupo de cartas

    // Dividir el mazo en grupos
    const grupos = [];
    for (let i = 0; i < mazo.length; i += grupoSize) {
        grupos.push(mazo.slice(i, i + grupoSize));
    }

    // Mezclar cada grupo de cartas
    for (let grupo of grupos) {
        for (let i = grupo.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [grupo[i], grupo[j]] = [grupo[j], grupo[i]];
        }
    }

    // Unir los grupos mezclados
    const mazoMezclado = [].concat(...grupos);

    return shuffle(mazoMezclado, repeticiones);
}


export {shuffle, shuffleExpertLevel};