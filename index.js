const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 5000;

const Board = require('./tictactoe/tictactoe');

const app = express();
app.use(cors());
app.use(express.json());

const board = new Board()

isGameOver = () => board.getWinner() != null;

getGameState = () => ({
    gameOver: isGameOver(),
    winner: board.getWinner(), //TODO: dont work now, nead fix
    cells: board.cells,
});

app.get('/game', (req, res) => {
    res.send(getGameState());
});

app.post('/game', (req, res) => {
    board = new Board();
    res.send(getGameState());
});

app.post('/turn', (req, res) => {
    if (isGameOver()) {
        return res.sendStatus(409);
    }

    let { x, y } = req.body;

    if (isNaN(x) || isNaN(y) || x < 0 || x > 2 || y < 0, y > 2) {
        return res.sendStatus(400);
    }

    if (board.isCellSelected(x, y)) {
        return res.sendStatus(403);
    }

    board.takeTurnFirst(x, y);

    if (isGameOver()) {
        return res.send(getGameState());
    }

    board.takeTurnSecond(x, y);

    res.send(getGameState())
});



app.listen(PORT, () => console.log(`Listening on localhost:${PORT}`))






