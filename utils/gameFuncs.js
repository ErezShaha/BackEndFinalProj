import Tictactoe from "../models/Tictactoe.js";
import MemoryGame from "../models/Memorygame.js";

const games = {}; //key room number. value gameName


export function createGame(room, gameName){
    
    if(games[room]){
        if(gameName === "Tictactoe"){ 
            games[room] instanceof Tictactoe ? games[room].restartGame() : games[room] = new Tictactoe();
            console.log(`Tictactoe Ended and ${gameName} started room ${room}`);
        }
        else{
            games[room] instanceof Tictactoe ? games[room] = new MemoryGame() : games[room].restartGame();
            console.log(`MemoryGame Ended and ${gameName} started room ${room}`);
        }
    }
    else{
        games[room] = gameName === "Tictactoe"? new Tictactoe() : new MemoryGame();
        console.log(`Started a new ${gameName} game in room ${room}`);
    }
    return games[room].gameBoard;
}

//proccess TTT turn
export  function proccessTurnTTT(room, slot){
    var resultDetails = {result: null, board: null, winCondition: null};

    resultDetails.result = games[room].updateGameBoard(slot);

    if(!resultDetails.result){
        var gameWon = games[room].checkWinConditions();
        if(gameWon){
            if(gameWon === "tie"){
                resultDetails.result = "tie";
            } else {
                resultDetails.result = "win";
                resultDetails.board = games[room].gameBoard;
                resultDetails.winCondition = gameWon;
            }
        }
    }

    if(!resultDetails.board){
        games[room].nextTurn();
        resultDetails.board = games[room].gameBoard;
    }
        
    return resultDetails;
}


//process Memory turn
export function proccessTurnMG(room, slotOne, slotTwo){
    var resultDetails = {result: null, board: null};
    resultDetails.result = games[room].updateGameBoard(slotOne, slotTwo);
    
    
    if(resultDetails.result === "Colors Matched"){
        resultDetails.board = games[room].gameBoard;

        var gameEnd = games[room].checkWinConditions();
        if (gameEnd) 
            resultDetails.result = gameEnd;
    }
    return resultDetails;
}

export function RevealMGSlot(room, slot) {
    return games[room].fullGameBoard[slot];
}

