import TictactoeGame from "TictactoeGame.js";
import MemoryGame from "../models/Memorygame.js";
const games = {};


export function createGame(room, gameName){
    
    if(games[room]){
        if(gameName === 'Tictactoe'){ 
            games[room] instanceof TictactoeGame ? games[room].restartGame() : games[room] = new MemoryGame();
            console.log(`Tictactoe Ended and ${gameName} started room ${room}`);
        }
        else{
            games[room] instanceof TictactoeGame ? games[room] = new TictactoeGame() : games[room].restartGame();
            console.log(`MemoryGame Ended and ${gameName} started room ${room}`);
        }
    }
    else{
        games[room] = gameName === 'Tictactoe'? new TictactoeGame() : new MemoryGame();
        console.log(`Started a new ${gameName} game in room ${room}`);
    }
}

//proccess TTT turn
export function proccessTurnTTT(room, slot){
    if(!games[room].updateGameBoard(slot)){
        return "Slot Taken";
    }

    var gameWon = games[room].checkWinConditions();
    if(gameWon){
        return gameWon;
    }

    games[room].nextTurn();
    return games[room].currnetPlayer;
}

//process Memory turn
export function proccessTurnMG(room, slotOne, slotTwo){
    var result = games[room].updateGameBoard(slotOne, slotTwo);

    if(result === "Point Scored!"){
        return games[room].checkWinConditions();
    }
    return games[room].currnetPlayer;
}

