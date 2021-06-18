import React, { useState, useEffect } from 'react';

import Choice from '../../components/Choice'
import InputForm from '../../components/InputForm'
import Loading from '../../components/Loading'
import Error from '../../components/Error'
import logo from './logo.png'

import { Redirect } from 'react-router-dom'

import socketIOClient from 'socket.io-client'
const ENDPOINT = 'http://localhost:5000/'

export default function EntryF() {

    const socket = socketIOClient(ENDPOINT)
    const [state, setState] = useState({
        step: 1,
        name: '',
        newGame: null,
        room: '',
        loading: false,
        serverConfirmed: false,
        error: false,
        errorMessage: '',
    })

    useEffect(() => {

        socket.on('newGameCreated', (room) => {
            setState({ ...state, serverConfirmed: true, room: room })
        })
        socket.on('joinConfirmed', () => {
            setState({ ...state, serverConfirmed: true })
        })
        socket.on('errorMessage', (message) => displayError(message))
    }, [])

    useEffect(() => {
        return () => {
            socket.disconnect()
        }
    }, [])

    const onChoice = (choice) => {
        const gameChoice = choice === 'new' ? true : false;
        const newState = { newGame: gameChoice }
        setState(...state, newState, () => {
            stepForward()
        })
    }

    const validate = () => {
        if (state.newGame) {
            return !(state.name === '')
        } else {
            return !(state.name === '') && !(state.room === '')
        }
    }

    const onSubmit = () => {
        setState({ ...state, loading: true })
        if (validate()) {
            if (state.newGame) {
                socket.emit('newGame')
            } else {
                socket.emit('joining', { room: state.room })
            }
        } else {
            setTimeout(() => setState({ ...state, loading: false }), 500)
            displayError(state.newGame ? 'Please fill out your name' : 'Please fill out your name and room id')
        }
    }

    const stepBack = () => {
        setState({ ...state, step: state.step - 1 })
    }

    const stepForward = () => {
        setState({ ...state, step: state.step + 1 })
    }

    const onTyping = (e) => {
        const target = e.target.name
        const newState = { [target]: e.target.value }
        setState(...state, newState)
    }

    const displayError = (message) => {
        setState({ ...state, error: true, errorMessage: message, loading: false })
        setTimeout(() => {
            setState({ ...state, error: false, errorMessage: '' })
        }, 3000)
    }

    let render;
    if (state.serverConfirmed) {
        render = (
            <Redirect to={`/game?room=${state.room}&name=${state.name}`} />
        )
    } else {
        switch (state.step) {
            case (1):
                render = (
                    <Choice logo={logo} onChoice={onChoice} />
                );
                break
            case (2):
                render = (
                    <>
                        <Loading loading={state.loading} />
                        <Error display={state.error} message={state.errorMessage} />
                        <InputForm
                            stepBack={stepBack}
                            onSubmit={onSubmit}
                            onTyping={onTyping}
                            newGame={state.newGame}
                            name={state.name}
                            room={state.room} />
                    </>
                );
                break
            default:
                render = null
        }
    }
    return (
        <div>{render}</div>
    )
}


