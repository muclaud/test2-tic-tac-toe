import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom'

import Square from '../components/Square';
import Wait from '../components/Wait'
import Status from '../components/Status'
import ScoreBoard from '../components/ScoreBoard'
import PlayAgain from '../components/PlayAgain'

import io from 'socket.io-client'
import qs from 'qs'
const ENDPOINT = 'http://localhost:5000/'

export default function GamePage() {

    const socket = io(ENDPOINT);

    let [socketID, setsocketID] = useState(null)
    const [state, setState] = useState({
        game: new Array(9).fill(null),
        piece: 'X',
        turn: true,
        end: false,
        room: '',
        statusMessage: '',
        currentPlayerScore: 0,
        opponentPlayer: [],
        waiting: false,
        joinError: false
    })



    const gameStart = (gameState, players, turn) => {
        const opponent = players.filter(([id, name]) => id !== socketID)[0][1]
        setState({ ...state, opponentPlayer: [opponent, 0], end: false })
        setBoard(gameState)
        setTurn(turn)
        setMessage()
    }

    const handleClick = (index) => {
        const { game, piece, end, turn, room } = state
        if (!game[index] && !end && turn) {
            socket.emit('move', { room, piece, index })
        }
    }

    const handleUpdate = (gameState, turn) => {
        setBoard(gameState)
        setTurn(turn)
        setMessage()
    }

    const handleWin = (id, gameState) => {
        setBoard(gameState)
        if (socketID === id) {
            const playerScore = state.currentPlayerScore + 1
            setState({ ...state, currentPlayerScore: playerScore, statusMessage: 'You Win' })
        } else {
            const opponentScore = state.opponentPlayer[1] + 1
            const opponent = state.opponentPlayer
            opponent[1] = opponentScore
            setState({ ...state, opponentPlayer: opponent, statusMessage: `${state.opponentPlayer[0]} Wins` })
        }
        setState({ ...state, end: true })
    }

    const handleDraw = (gameState) => {
        setBoard(gameState)
        setState({ ...state, end: true, statusMessage: 'Draw' })
    }

    const playAgainRequest = () => {
        socket.emit('playAgainRequest', state.room)
    }

    const handleRestart = (gameState, turn) => {
        setBoard(gameState)
        setTurn(turn)
        setMessage()
        setState({ ...state, end: false })
    }

    const setMessage = () => {
        const message = state.turn ? 'Your Turn' : `${state.opponentPlayer[0]}'s Turn`
        setState({ ...state, statusMessage: message })
    }

    const setTurn = (turn) => {
        if (state.piece === turn) {
            setState({ ...state, turn: true })
        } else {
            setState({ ...state, turn: false })
        }
    }

    const setBoard = (gameState) => {
        setState({ ...state, game: gameState })
    }

    const renderSquare = (i) => {
        return (
            <Square key={i} value={state.game[i]}
                player={state.piece}
                end={state.end}
                id={i}
                onClick={handleClick}
                turn={state.turn} />
        )
    }

    useEffect(() => {

        const { room, name } = qs.parse(window.location.search, {
            ignoreQueryPrefix: true
        })
        setState({ ...state, room })
        socket.emit('newRoomJoin', { room, name })


        socket.on('waiting', () => setState({ ...state, waiting: true, currentPlayerScore: 0, opponentPlayer: [] }))
        socket.on('starting', ({ gameState, players, turn }) => {
            setState({ ...state, waiting: false })
            gameStart(gameState, players, turn)
        })
        socket.on('joinError', () => setState({ ...state, joinError: true }))


        socket.on('pieceAssignment', ({ piece, id }) => {
            setState({ ...state, piece: piece })
            setsocketID(id);
        })

        socket.on('update', ({ gameState, turn }) => handleUpdate(gameState, turn))
        socket.on('winner', ({ gameState, id }) => handleWin(id, gameState))
        socket.on('draw', ({ gameState }) => handleDraw(gameState))

        socket.on('restart', ({ gameState, turn }) => handleRestart(gameState, turn))
    }, [])


    let render;
    if (state.joinError) {
        render = (<Redirect to={`/`} />)
    } else {
        const squareArray = []
        for (let i = 0; i < 9; i++) {
            const newSquare = renderSquare(i)
            squareArray.push(newSquare)
        }
        render = (
            <>
                <Wait display={state.waiting} room={state.room} />
                <Status message={state.statusMessage} />
                <div className="board">
                    {squareArray}
                </div>
                <ScoreBoard data={{ player1: ['You', state.currentPlayerScore], player2: [state.opponentPlayer[0], state.opponentPlayer[1]] }} />
                <PlayAgain end={state.end} onClick={playAgainRequest} />
            </>
        )
    }

    return (
        <div>{render}</div>
    );
}

