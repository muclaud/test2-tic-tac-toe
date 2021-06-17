const cors = require('cors');
const { randomRoom, randomPiece } = require('./tictactoe/utils');
const Player = require('./tictactoe/player');
const Board = require('./tictactoe/board');

const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const io = socketio(server)

app.use(cors())

const rooms = new Map()

const makeRoom = (resolve) => {
    let newRoom = randomRoom();
    while (rooms.has(newRoom)) {
        newRoom = randomRoom()
    }
    rooms.set(newRoom, { roomId: newRoom, players: [], board: null });
    resolve(newRoom);
}

const joinRoom = (player, room) => {
    currentRoom = rooms.get(room);
    updatedPlayerList = currentRoom.players.push(player);
    updatedRoom = { ...currentRoom, players: updatedPlayerList }
}

const kick = (room) => {
    currentRoom = rooms.get(room);
    currentRoom.players.pop();
}

const getRoomPlayersNum = (room) => rooms.get(room).players.length;

const pieceAssignment = (room) => {
    const firstPiece = randomPiece()
    const lastPiece = firstPiece === 'X' ? 'O' : 'X';

    currentRoom = rooms.get(room)
    currentRoom.players[0].piece = firstPiece;
    currentRoom.players[1].piece = lastPiece;
}

const newGame = (room) => {
    currentRoom = rooms.get(room);
    const board = new Board;
    currentRoom.board = board;
}

io.on('connection', socket => {
    socket.on('newGame', () => {
        new Promise(makeRoom).then((room) => {
            socket.emit('newGameCreated', room);
        })
    })

    socket.on('joining', ({ room }) => {
        if (rooms.has(room)) {
            socket.emit('joinConfirmed')
        } else {
            socket.emit('errorMessage', 'room not found')
        }
    })
    socket.on('newRoomJoin', ({ room, name }) => {
        if (rooms === '' || name === '') {
            io.to(docket.id).emit('joinError')
        }

        socket.join(room);
        const id = socket.id;
        const newPlayer = new Player(name, room, id);
        joinRoom(newPlayer, room);

        const peopleInRoom = getRoomPlayersNum(room);

        if (peopleInRoom === 1) {
            io.to(room).emit('waiting')
        }

        if (peopleInRoom === 2) {
            pieceAssignment(room);
            currentPlayers = rooms.get(room).players;
            for (let player of currentPlayers) {
                io.to(player.id).emit('pieceAssignment', { piece: player.piece, id: player.id });
            }
            newGame(room)
            const currentRoom = rooms.get(room);
            const gameState = currentRoom.board.game;
            const turn = currentRoom.players.map((player) => [player.id, player.name])
            io.to(room).emit('starting', { gameState, players, turn })
        }

        if (peopleInRoom === 3) {
            socket.leave(room)
            kick(room)
            io.to(socket.id).emit('joinError')
        }
    })

    socket.on('move', ({ room, piece, index }) => {
        currentBoard = rooms.get(room).board;
        currentBoard.move(index, piece)

        if (currentBoard.checkWinner(piece)) {
            io.to(room).emit('winner', { gameState: currentBoard.game, id: socket.id })
        } else if (currentBoard.checkDraw()) {
            io.to(room).emit('draw', { gameState: currentBoard.game })
        } else {
            currentBoard.switchTurn()
            io.to(room).emit('update', { gameState: currentBoard.game, turn: currentBoard.turn })
        }
    })

    socket.on('playAgainRequest', (room) => {
        currentRoom = rooms.get(room);
        currentRoom.board.reset();

        pieceAssignment(room)
        currentPlayers = currentRoom.players;
        for (let player of currentPlayers) {
            io.to(player.id).emit('pieceAssignment', { piece: player.piece, id: player.id })
        }

        io.to(room).emit('restart', { gameState: currentRoom.board.game, turn: currentRoom.board.turn })
    })

    socket.on('disconnecting', () => {
        const currentRooms = Object.keys(socket.rooms);
        if (currentRooms.length === 2) {
            const room = currentRooms[1];
            const num = getRoomPlayersNum(room)
            if (num === 1) {
                rooms.delete(room)
            }
            if (num === 2) {
                currentRoom = rooms.get(room);
                currentRoom.players = currentRoom.players.filter((player) => player.id !== socket.id)
                io.to(room).emit('waiting')
            }
        }
    })
})


server.listen(PORT, () => console.log(`Listening on localhost:${PORT}`))
