const randomRoom = () => {
    let result = Math.floor(Math.random() * 1000000).toString();
    return result;
}

const randomPiece = () => {
    return Math.random() > 0.5 ? 'X' : 'O'
}

module.exports = { randomPiece, randomRoom };