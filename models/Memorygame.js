export default class MemoryGame {
    
    constructor() {
        this.gameBoard = ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'E', 'E', 'F', 'F'];
        this.playerOneScore = 0;
        this.playerTwoScore = 0;
        this.currentPlayer = 'Player One';
        this.turn = 1;
    }

    restartGame() {
        for (let i = this.gameBoard.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.gameBoard[i], this.gameBoard[j]] = [this.gameBoard[j], this.gameBoard[i]];
        }
        this.playerOneScore = 0;
        this.playerTwoScore = 0;
    }

    updateGameBoard(slotOne, slotTwo) {
        if(this.gameBoard[slotOne] === this.gameBoard[slotTwo]) {
            this.currentPlayer === 'Player One' ? this.playerOneScore++ : this.playerTwoScore++;
            return "Point Scored!";
        };
        return "Rip Bozo";
    }

    checkWinConditions() {
        if (this.playerOneScore)
        if (this.playerOneScore + this.playerTwoScore === this.gameBoard / 2) {
            
        }
    }
}