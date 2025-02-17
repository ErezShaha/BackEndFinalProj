import express from "express";
import { config } from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routers/userRouter.js";
import http from "http";
import { Server } from "socket.io";
import {
  createGame,
  proccessTurnTTT,
  proccessTurnMG,
  RevealMGSlot
} from "./utils/gameFuncs.js";
//import { searchOrCreateRoom } from "./utils/funcions.js"

config();

const app = express();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
const io = new Server(server, {
  cors: "*",
});

export const onlineUsers = {};
const onlineUsersByUsername = {};
const openRooms = {};
const roomChatsMsgs = {};
var roomChatsNumber = 0;

io.on("connection", (socket) => {
  console.log(`Socket ${socket.id} Connected`);

  // LogIn
  socket.on("UserLogin", (username) => {
    onlineUsers[socket.id] = { username: username };
    onlineUsersByUsername[username] = { socketID: socket.id };
    console.log(`Socket ${socket.id} Loggedin To User ${username}`);

    // onlineChange
    console.log(onlineUsers);
    io.emit("OnlineUsersChange", Object.values(onlineUsers));
  });

  // LogOut
  socket.on("UserLogout", () => {
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });

    console.log(`Socket ${socket.id} Loggedout from User ${onlineUsers[socket.id]}`);

    const disconnectingUser = onlineUsers[socket.id];
    if (disconnectingUser) {

      // checking if both users in a room are logged out the chat they had is deleted
      for (const [roomNumber, usersInRoom] of Object.entries(openRooms)) {
        // if the logging out user is in the room
        if (usersInRoom.includes(disconnectingUser.username)) {
          const otherUser = usersInRoom.find(
            (u) => u !== disconnectingUser.username
          );
          // and the second user in the room is logged out
          if (!onlineUsersByUsername[otherUser]) {
            console.log(
              `Deleting Chat Room of ${disconnectingUser} and ${otherUser}`
            );
            delete openRooms[roomNumber];
            delete roomChatsMsgs[roomNumber];
          }
        }
      }
    }

    if (onlineUsers[socket.id])
      delete onlineUsersByUsername[onlineUsers[socket.id].username];
    delete onlineUsers[socket.id];
    console.log(`Jobs Done. ${onlineUsers}`);

    // onlineChange
    console.log(onlineUsers);
    io.emit("OnlineUsersChange", Object.values(onlineUsers));
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("======================Disconnect Start==========================");
    console.log(`Socket ${socket.id} disconnected. Logging out from user ${onlineUsers[socket.id]}`);

    const disconnectingUser = onlineUsers[socket.id];
    if (disconnectingUser) {
      // checking if both users in a room are logged out the chat they had is deleted
      for (const [roomNumber, usersInRoom] of Object.entries(openRooms)) {
        if (usersInRoom.includes(disconnectingUser.username)) {
          const otherUser = usersInRoom.find(
            (u) => u !== disconnectingUser.username
          );

          if (!onlineUsersByUsername[otherUser]) {
            console.log(
              `Deleting Chat Room of ${disconnectingUser} and ${otherUser}`
            );
            delete openRooms[roomNumber];
            delete roomChatsMsgs[roomNumber];
          }
        }
      }
    }
    if (onlineUsers[socket.id])
      delete onlineUsersByUsername[onlineUsers[socket.id].username];
    delete onlineUsers[socket.id];

    // onlineChange
    console.log(onlineUsers);
    io.emit("UpdatedOnlineUsers", Object.values(onlineUsers));
    console.log("======================Disconnect End==========================");
  });

  socket.on("CheckLoggedin", (username) => {
    // if user changed socket id (refreash page) they get relogged in
    if (!onlineUsers[socket.id]) {
      onlineUsers[socket.id] = { username: username };
      onlineUsersByUsername[username] = { socketID: socket.id };
      console.log("user changed socket");
    }
    
    io.emit("OnlineUsersChange", Object.values(onlineUsers));
  });

    


  socket.on("SendMessageToEveryone", (message) => {
    const now = new Date();
    const messageObject = {
      id: Date.now(),
      content: message,
      user: onlineUsers[socket.id],
      msgTime: `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
    };

    io.emit("RecieveGlobalMessage", messageObject);
  });

  socket.on("SendMessageToRoom", (room, message) => {
    const now = new Date();
    const messageObject = {
      id: Date.now(),
      content: message,
      user: onlineUsers[socket.id],
      msgTime: `${now.getHours().toString().padStart(2, "0")}:${now
        .getMinutes()
        .toString()
        .padStart(2, "0")}`,
    };

    //adding new msg to the old msgs in the room
    roomChatsMsgs[room] = [...(roomChatsMsgs[room] || []), messageObject];
    console.log("sending msg to" + openRooms[room]);
    io.to(room).emit("RecieveDmMessage", messageObject);

    // sending msg notification to the other user if theyre not in the room right now
    const currentRoom = io.sockets.adapter.rooms.get(room);
    openRooms[room].forEach((user) => {
      if (
        user !== onlineUsers[socket.id].username &&
        !currentRoom.has(onlineUsersByUsername[user].socketID)
      ) {
        io.to(onlineUsersByUsername[user].socketID).emit(
          "MsgNotif",
          onlineUsers[socket.id].username
        );
      }
    });
  });
  
  
   // joining a room and loading the msgs
   socket.on("JoinAndLoadRoom", (room) => {
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
    socket.join(room);

    io.to(socket.id).emit(
      "LoadRoomChat",
      roomChatsMsgs[room] || [],
      openRooms[room],
      room
    );
  });



  socket.on("StartChatRoom", (secondUser) => {
    const firstUser = onlineUsers[socket.id].username;
    const secondUserSocketID = onlineUsersByUsername[secondUser].socketID;

    const roomNumber = searchOrCreateRoom(firstUser, secondUser);

    io.to(socket.id).emit("RoomNumberForUser", secondUser, roomNumber);
    io.to(secondUserSocketID).emit("RoomNumberForUser", firstUser, roomNumber);

    socket.join(roomNumber);
    io.to(socket.id).emit(
      "LoadRoomChat",
      roomChatsMsgs[roomNumber] || [],
      openRooms[roomNumber],
      roomNumber
    );
  });


  socket.on("InviteUserToGame", (secondUser) => {
    const firstUser = onlineUsers[socket.id].username;
    const secondUserSocketID = onlineUsersByUsername[secondUser].socketID;
    const roomNumber = searchOrCreateRoom(firstUser, secondUser);

    // sending room number to both users
    io.to(socket.id).emit("RoomNumberForUser", secondUser, roomNumber);
    io.to(secondUserSocketID).emit("RoomNumberForUser", firstUser, roomNumber);

    io.to(secondUserSocketID).emit("GameNotif", firstUser);

    // sending sending the inviting user to wait in the game page
    io.to(socket.id).emit("GoWaitInGameRoom", roomNumber);
    socket.emit("UserIsIngame", firstUser, secondUser);
  });


  socket.on("JoinGameRoom", (room, secondUser) => {
    const firstUser = onlineUsers[socket.id].username;
    io.to(onlineUsersByUsername[secondUser].socketID).emit(
      "GameNotif",
      firstUser
    );

    // sending sending the inviting user to wait in the game page
    io.to(socket.id).emit("GoWaitInGameRoom", room);
    socket.emit("UserIsIngame", firstUser, secondUser);
  });





  // sending a check to see if both users are in the game page
  socket.on("StartGameRoom", (room, url) => {
    socket.to(room).emit("AreYouHereToPlay", url);
  });
  
  // both players are in the game page can start
  socket.on("ImHereLetsGo", (room) => {
    io.to(room).emit("BothHere");
  });


  socket.on("CancelGame", (room) => {
    io.to(room).emit("MoveToGame", null);
  });

  socket.on("PlayerLeft", (room) => {
    io.to(room).emit("PlayerLeft");
  })


  // starting / restarting the selected game
  socket.on("GamePicked", (gameName, room) => {
    var cleanboard = createGame(room, gameName);
    io.to(room).emit("MoveToGame", gameName);
    io.to(room).emit("UpdateBoard", cleanboard);
    // sending the sending person that hes the first player
    socket.to(room).emit("You'reFirst");
  });


  //checking the color of a memory game slot and returning the color
  socket.on("LookAtSlot", (room, slot) => {
    io.to(room).emit("RevealedSlot", RevealMGSlot(room, slot), slot);
  })

  // proccess memory game turn and returning the correct emit for the result of the turn
  socket.on("TurnTakenMG", (room, slots) => {
    var {result, board} = proccessTurnMG(room, slots[0], slots[1]);

    console.log(result, board);

    if(result) {
      if (result === "Colors Matched")
        io.to(room).emit("UpdateBoard", board);
      else if (result === "Tie"){
        io.to(room).emit("UpdateBoard", board);
        io.to(room).emit("Tie");
      }
      else if (result === "Win"){
        io.to(room).emit("UpdateBoard", board);
        io.to(room).emit("Win", null , onlineUsers[socket.id].username);
      }
      else if (result === "Next Turn")
        setTimeout(() => {
          io.to(room).emit("NextTurn");
        } ,500)
      }
  });  


  // proccess Tictaktoe turn and returning the correct emit for the result of the turn
  socket.on("TurnTakenTTT", (room, slot) => {
    var {result, board, winCondition} = proccessTurnTTT(room, slot);
    

    io.to(room).emit("UpdateBoard", board);

    if (result === "tie") {
      io.to(room).emit("Tie");
    } else if (result === "win") {
      io.to(room).emit("Win", winCondition, onlineUsers[socket.id].username);
    } else {
      io.to(room).emit("NextTurn");
    }
  });
});





app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/users", userRouter);

mongoose
  .connect(process.env.MONGO_CONNECTION)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Listening on PORT ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });



const searchOrCreateRoom = (firstUsername, secondUsername) => {
  for (const [roomNumber, usersInRoom] of Object.entries(openRooms)) {
    if (
      usersInRoom.includes(secondUsername) &&
      usersInRoom.includes(firstUsername)
    ) {
      console.log("existing room found: " + roomNumber);

      return roomNumber;
    }
  }
  const newChatRoomNumber = ++roomChatsNumber;
  console.log("new room was created: " + newChatRoomNumber);
  openRooms[newChatRoomNumber] = [firstUsername, secondUsername];

  return newChatRoomNumber;
};