export default class MemoryGame {
    
    constructor() {
        this.gameBoard = ['Blue', 'Blue', 'Orange', 'Orange', 'Red', 'Red', 'Purple', 'Purple', 'Green', 'Green', 'Yellow', 'Yellow'];
        shuffleBoard();
        this.currentPlayer = 'Player One';
        this.playerOneScore = 0;
        this.playerTwoScore = 0;
        this.turn = 1;
    }

    restartGame() {
        shuffleBoard();
        this.playerOneScore = 0;
        this.playerTwoScore = 0;
    }

    updateGameBoard(slotOne, slotTwo) {
        this.turn++;
        if(this.gameBoard[slotOne] === this.gameBoard[slotTwo]) {
            this.currentPlayer === 'Player One' ? this.playerOneScore++ : this.playerTwoScore++;
            return "Point Scored!";
        };
        this.currentPlayer === 'Player One'? this.currentPlayer = 'Player Two' : this.currentPlayer = 'Player One';
        return "Rip Bozo";
    }

    checkWinConditions() {
        if (this.playerOneScore === (this.gameBoard / 2 + 1))
            return 'Player One Wins!';
        if (this.playerTwoScore === (this.gameBoard / 2 + 1))
            return 'Player Two Wins!';
        if (this.playerOneScore === this.gameBoard / 2 && this.playerTwoScore === this.gameBoard / 2)
            return 'Its A Tie!';
        return "No Winner Yet";
    }
}

function shuffleBoard() {
    for (let i = this.gameBoard.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.gameBoard[i], this.gameBoard[j]] = [this.gameBoard[j], this.gameBoard[i]];
    }
}