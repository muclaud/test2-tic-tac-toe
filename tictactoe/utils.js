const randRoom = () => {
    let result = Math.floor(Math.random() * 1000000).toString();
    return result;
}

const randPiece = () => {
    return Math.random() > 0.5 ? 'X' : 'O'
}

module.exports = { randPiece, randRoom };