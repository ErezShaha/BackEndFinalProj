export default class MemoryGame {
    
    shuffleBoard() {
        for (let i = this.fullGameBoard.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.fullGameBoard[i], this.fullGameBoard[j]] = [this.fullGameBoard[j], this.fullGameBoard[i]];
        }
    }

    constructor() {
        this.fullGameBoard = ['Blue', 'Blue', 'Orange', 'Orange', 'Red', 'Red', 'Purple', 'Purple', 'Green', 'Green', 'Yellow', 'Yellow', 'Pink', 'Pink', 'Cyan', 'Cyan'];
        this.shuffleBoard();
        this.gameBoard = ['', '', '', '', '', '', '', '','','','','','','','',''];
        this.currentPlayer = 'Player One';
    }

    restartGame() {
        this.shuffleBoard();
        this.gameBoard = ['', '', '', '', '', '', '', '','','','','','','','',''];
    }

    updateGameBoard(slotOne, slotTwo) {
        if(this.gameBoard[slotOne] === ''){
            if(this.fullGameBoard[slotOne] === this.fullGameBoard[slotTwo]) {
                this.gameBoard[slotOne] = {player: this.currentPlayer, color: this.fullGameBoard[slotOne]};
                this.gameBoard[slotTwo] = {player: this.currentPlayer, color: this.fullGameBoard[slotTwo]};
                console.log("update board colors matched")
                return "Colors Matched";
            };
            this.currentPlayer === 'Player One'? this.currentPlayer = 'Player Two' : this.currentPlayer = 'Player One';
            return "Next Turn"
        };
    }

    checkWinConditions() {
        const playerScore = this.gameBoard.filter(slot => slot.player === this.currentPlayer).length;

        if ( playerScore > (this.fullGameBoard.length / 2))
            return 'Win';

        const slotsLeft = this.gameBoard.filter(slot => slot !== '').length;
        if (slotsLeft === this.fullGameBoard.length)
            return 'Tie';
    }

}
