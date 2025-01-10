export default class MemoryGame {
    
    shuffleBoard() {
        for (let i = this.fullGameBoard.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.fullGameBoard[i], this.fullGameBoard[j]] = [this.fullGameBoard[j], this.fullGameBoard[i]];
        }
    }

    constructor() {
        this.fullGameBoard = ['Blue', 'Blue', 'Orange', 'Orange', 'Red', 'Red', 'Purple', 'Purple', 'Green', 'Green', 'Yellow', 'Yellow', 'Pink', 'Pink', 'Cyan', 'Cyan'];
        shuffleBoard();
        this.gameBoard = ['', '', '', '', '', '', '', '','','','','','','','',''];
        this.currentPlayer = 'Player One';
        this.playerOneScore = 0;
        this.playerTwoScore = 0;
        this.turn = 1;
    }

    restartGame() {
        shuffleBoard();
        this.gameBoard = ['', '', '', '', '', '', '', '','','','','','','','',''];
        this.playerOneScore = 0;
        this.playerTwoScore = 0;
    }

    updateGameBoard(slotOne, slotTwo) {
        this.turn++;
        if(this.fullGameBoard[slotOne] === this.fullGameBoard[slotTwo]) {
            this.currentPlayer === 'Player One' ? this.playerOneScore++ : this.playerTwoScore++;
            this.gameBoard[slotOne] = this.fullGameBoard[slotOne];
            this.gameBoard[slotTwo] = this.fullGameBoard[slotTwo];
            return "Colors Matched";
        };
        this.currentPlayer === 'Player One'? this.currentPlayer = 'Player Two' : this.currentPlayer = 'Player One';
    }

    checkWinConditions() {
        if (this.playerOneScore === (this.fullGameBoard.length / 4 + 1) || this.playerTwoScore === (this.fullGameBoard.length / 4 + 1))
            return 'Win';
        if (this.playerOneScore === this.fullGameBoard.length / 4 && this.playerTwoScore === this.fullGameBoard.length / 4)
            return 'Tie';
    }

}
