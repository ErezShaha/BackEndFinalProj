import TictactoeGame from "TictactoeGame.js";
const games = {};


export function createTictactoeGame(room){
    games[room] = new TictactoeGame();
}
export function proccessTurn(room, slot){
    if(!games[room].updateGameBoard(slot)){
        return "Slot Taken";
    }
    return games[room].checkWinConditions();
}
export function endTurn(room) {
    games[room].nextTurn();
    return games[room].currnetPlayer;
}
