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

export default Carta;