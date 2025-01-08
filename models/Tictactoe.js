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
    restartGame() {
        this.gameBoard = ['', '', '', '', '', '', '', '',''];
        this.currentPlayer = 'X';
        this.turn = 1;
    }
    updateGameBoard(slot) {
        if(this.gameBoard.indexOf(slot) === '') {
            this.gameBoard[slot] = this.currentPlayer;
        } else {
            return false;
        }
    }
    checkWinConditions() {
        for(let i = 0; i < winConditions.length; i++) {
            const condition = winConditions[i];
            if(
                this.gameBoard[condition[0]] === this.currentPlayer &&
                this.gameBoard[condition[1]] === this.currentPlayer &&
                this.gameBoard[condition[2]] === this.currentPlayer
            ) {
                return winConditions[i];
            }
        }
        if(turn === this.gameBoard.length+1) {
            return "tie";
        }        
        return false;
    }
    nextTurn() {
        this.games[room].turn++;
        this.currentPlayer === 'X' ? this.currentPlayer = 'O' : this.currentPlayer = 'X';
    }
}