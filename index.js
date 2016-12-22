let isTraining = false;
let playerTurn = 1;
const aiPlayer = 2;

const historyStates = {};

let currentGameStates = [];

let currentState = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
];

const trainDebug = {
    not_in_history: 0,
    random_move: 0
};

function updateHistoryState() {
    const isWinner = checkIfWin() === aiPlayer;
    currentGameStates.forEach(state => {
        const stateAsString = _.flatten(state).join('');
        if (!historyStates[stateAsString]) {
            historyStates[stateAsString] = { win: 0, lose: 0 };
        }
        if (isWinner) {
            historyStates[stateAsString].win += 1;
        } else {
            historyStates[stateAsString].lose += 1;
        }
    });
}

function updateState(x, y, newState) {
    if (newState) {
        currentState = [].concat(newState);
    } else {
        if (currentState[y][x] !== 0) {
            return;
        }
        currentState[y][x] = playerTurn;
    }
    currentGameStates.push(_.flatten(currentState).join(''));
    playerTurn = (playerTurn === 1) ? 2 : 1;
    render();
}

function getAvailabledMoves() {
    const availabledMoves = [];
     _.flatten(currentState).forEach((value, index) => {
        if (value === 0) {
            const move = _.flatten(currentState);
            move[index] = playerTurn;
            availabledMoves.push([
                [move[0], move[1], move[2]],
                [move[3], move[4], move[5]],
                [move[6], move[7], move[8]]
            ]);
        }
     });
     return availabledMoves;
}

function randomPlay () {
    trainDebug.random_move += 1;
    const availabledMoves = getAvailabledMoves();
    return updateState(null, null, availabledMoves[_.random(0, availabledMoves.length - 1)]);
}

function stateToString(state) {
    return _.flatten(state).join('');
}

function aiPlays () {
    const availabledMoves = getAvailabledMoves(playerTurn);
    const moveFromHistory = availabledMoves.filter(move => {
        return historyStates[_.flatten(move).join('')];
    });
    if (!moveFromHistory.length) {
        trainDebug.not_in_history += 1;
        return randomPlay();
    }
    if (isTraining && playerTurn === 1) {
        return randomPlay();
    }
    let bestMove = moveFromHistory[0];
    moveFromHistory.map(move => _.flatten(move).join('')).forEach((moveId, index) => {
        const move = historyStates[moveId];
        if (move.win > historyStates[stateToString(bestMove)].win) {
            bestMove = moveFromHistory[index];
        }
    });
    if(isTraining && historyStates[stateToString(bestMove)]) {
        return randomPlay();
    }
    if (historyStates[stateToString(bestMove)].win / historyStates[stateToString(bestMove)].lose < 1) {
        return randomPlay();
    }
    if (historyStates[stateToString(bestMove)].win - historyStates[stateToString(bestMove)].lose <= 0) {
        return randomPlay();
    }
    // console.log(stateToString(bestMove));
    return updateState(null, null, bestMove);
}

function reset() {
    playerTurn = 1;
    updateHistoryState();
    currentState = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
    ];
    currentGameStates = [];
    render();
}

function attachListener() {
    document.body.getElementsByTagName('table')[0].addEventListener('click', (e) => {
        const x = e.target.dataset.posx;
        const y = e.target.dataset.posy;
        updateState(x, y);
        setTimeout(() => {
            let winner = checkIfWin();
            if (winner !== 0) {
                if (winner == -1) {
                    alert('Even');
                } else {
                    alert('Player ' + winner + ' won!');
                }
                reset();
            } else {
                if (playerTurn === aiPlayer) {
                    aiPlays();
                    setTimeout(() => {
                        winner = checkIfWin();
                        if (winner !== 0) {
                            if (winner == -1) {
                                alert('Even');
                            } else {
                                alert('Player ' + winner + ' won!');
                            }
                            reset();
                        }
                    }, 100);
                }
            }
        }, 100);
    });
}
function checkIfWin() {
    for (let i = 0; i <= 2; i ++) {
        if (currentState[i][0] === currentState[i][1] && currentState[i][1] === currentState[i][2]) {
            return currentState[i][0];
        }
        if (currentState[0][i] === currentState[1][i] && currentState[1][i] === currentState[2][i]) {
            return currentState[0][i]
        }
    }
    if (currentState[1][1] !== 0) {
        if (currentState[0][0] === currentState[1][1] && currentState[1][1] === currentState[2][2]) {
            return currentState[0][0]
        }
        if (currentState[2][0] === currentState[1][1] && currentState[1][1] === currentState[0][2]) {
            return currentState[2][0];
        }
    }
    if (_.flatten(currentState).indexOf(0) === -1) {
        return -1;
    }
    return 0;
}

function getSymbol(nb) {
    switch (nb) {
        case 1:
            return 'X';
        case 2:
            return 'O';
        default:
            return '';
    }
}
function render() {
    document.body.getElementsByTagName('table')[0].innerHTML = currentState.map((line, index) => {
        return [
            '<tr>',
                '<td data-posx="0" data-posy="' + index + '">' + getSymbol(line[0]) + '</td>',
                '<td data-posx="1" data-posy="' + index + '">' + getSymbol(line[1]) + '</td>',
                '<td data-posx="2" data-posy="' + index + '">' + getSymbol(line[2]) + '</td>',
            '</tr>'
        ].join('');
    }).join('');
}


function init() {
    attachListener();
    render();
}

function train(nb) {
    nb = nb || '100';
    isTraining = true;
    for(let i = 1; i <= nb; i++) {
        while(checkIfWin() === 0) {
            aiPlays((playerTurn === 1) ? 2 : 1);
        }
        reset();
        console.log('played ' + i + ' games');
    }
    console.log('Training done', trainDebug);
    _.each(historyStates, (value, key) => {
        key = key.split('').map(k => {
            if (k === '1') { return '2'; }
            if (k === '2') { return '1'; }
            return k;
        }).join('');
        if (!historyStates[key]) {
            historyStates[key] = { win: 0, lose: 0 };
        }
        historyStates[key].win += value.lose;
        historyStates[key].lose += value.win;
    });
    isTraining = false;
}
