export default class TictactoeGame {
    winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];

    constructor() {
        this.gameBoard = ['', '', '', '', '', '', '', '',''];
        this.currentPlayer = 'X';
        this.turn = 1;
    }
    updateGameBoard(slot) {
        if(games[room].gameBoard.indexOf(slot) === '') {
            gameBoard[slot] = currnetPlayer;
        } else {
            return false;
        }
    }
    checkWinConditions() {
        for(let i = 0; i < winConditions.length; i++) {
            const condition = winConditions[i];
            if(
            gameBoard[condition[0]] === player &&
            gameBoard[condition[1]] === player &&
            gameBoard[condition[2]] === player
            ) {
                return winConditions[i];
            }
        }
        if(turn === gameBoard.length+1) {
            return "tie";
        }        
        return false;
    }
    nextTurn() {
        games[room].turn++;
        this.currentPlayer === 'X' ? this.currentPlayer = 'O' : this.currentPlayer = 'X';
    }
}