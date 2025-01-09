import Tictactoe from "../models/Tictactoe.js";
import MemoryGame from "../models/Memorygame.js";

const games = {}; //key room number. value gameName


export function createGame(room, gameName){
    
    if(games[room]){
        if(gameName === 'Tictactoe'){ 
            games[room] instanceof Tictactoe ? games[room].restartGame() : games[room] = new MemoryGame();
            console.log(`Tictactoe Ended and ${gameName} started room ${room}`);
        }
        else{
            games[room] instanceof Tictactoe ? games[room] = new Tictactoe() : games[room].restartGame();
            console.log(`MemoryGame Ended and ${gameName} started room ${room}`);
        }
    }
    else{
        games[room] = gameName === 'Tictactoe'? new Tictactoe() : new MemoryGame();
        console.log(`Started a new ${gameName} game in room ${room}`);
    }
}

//proccess TTT turn
export function proccessTurnTTT(room, slot){
    var resultDetails = {result: null, board: null, turn: null};
    resultDetails.result = games[room].updateGameBoard(slot);
    
    if(!resultDetails.result){
        var gameWon = games[room].checkWinConditions();
        if(gameWon){
            if(gameWon === "tie"){
                resultDetails.result = "tie";
            } else {
                resultDetails.result = "win";
                resultDetails.board = gameWon;
            }
        }
    }

    if(!resultDetails.result) {
        resultDetails.result
    }
    if(!resultDetails.board){
        games[room].nextTurn();
        resultDetails.board = games[room].gameBoard;
    }
    
    resultDetails.turn = games[room].currnetPlayer;
    
    return resultDetails;
}

//process Memory turn
export function proccessTurnMG(room, slotOne, slotTwo){
    var result = games[room].updateGameBoard(slotOne, slotTwo);

    if(result === "Point Scored!"){
        return games[room].checkWinConditions();
    }
    return games[room].currnetPlayer;
}

