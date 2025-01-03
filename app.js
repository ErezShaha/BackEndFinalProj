import express from "express";
import { config } from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routers/userRouter.js";
import http from "http";
import { Server } from "socket.io";

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
    io.emit("hereTakeYourUser", Object.values(onlineUsers));
  });

  // LogOut
  socket.on("UserLogout", () => {
    socket.rooms.forEach((room) => {socket.leave(room);});
    console.log(
      `Socket ${socket.id} Loggedout from User ${onlineUsers[socket.id]}`
    );
    const disconnectingUser = onlineUsers[socket.id];
    if(disconnectingUser) {
        for (const [roomNumber, usersInRoom] of Object.entries(openRooms)) {
            if (usersInRoom.includes(disconnectingUser.username)) {
            const otherUser = usersInRoom.find(
                (u) => u !== disconnectingUser.username
            );

            if (!onlineUsersByUsername[otherUser]) {
                console.log(`Deleting Chat Room of ${disconnectingUser} and ${otherUser}`);  
                delete openRooms[roomNumber];
                delete roomChatsMsgs[roomNumber];
            }
            }
        }
    }

    if(onlineUsers[socket.id])
        delete onlineUsersByUsername[onlineUsers[socket.id].username];
    delete onlineUsers[socket.id];
    console.log(`Jobs Done. ${onlineUsers}`);

    // onlineChange
    console.log(onlineUsers);
    io.emit("hereTakeYourUser", Object.values(onlineUsers));
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(
      "======================Disconnect Start=========================="
    );
    console.log(
      `Socket ${socket.id} disconnected. Logging out from user ${
        onlineUsers[socket.id]
      }`
    );
    const disconnectingUser = onlineUsers[socket.id];

    for (const [roomNumber, usersInRoom] of Object.entries(openRooms)) {
      if (usersInRoom.includes(disconnectingUser.username)) {
        const otherUser = usersInRoom.find(
          (u) => u !== disconnectingUser.username
        );

        if (!onlineUsersByUsername[otherUser]) {
          console.log(`Deleting Chat Room of ${disconnectingUser} and ${otherUser}`);  
          delete openRooms[roomNumber];
          delete roomChatsMsgs[roomNumber];
        }
      }
    }

    if(onlineUsers[socket.id])
        delete onlineUsersByUsername[onlineUsers[socket.id].username];
    delete onlineUsers[socket.id];

    // onlineChange
    console.log(onlineUsers);
    io.emit("hereTakeYourUser", Object.values(onlineUsers));
    console.log(
      "======================Disconnect End=========================="
    );
  });

  socket.on("giveMeMyUser", () => {
    console.log(onlineUsers);
    io.emit("hereTakeYourUser", Object.values(onlineUsers));
  });

  socket.on("CheckLoggedin", (username) => {
    if (!onlineUsers[socket.id]) {
      onlineUsers[socket.id] = { username: username };
      onlineUsersByUsername[username] = { socketID: socket.id };
      console.log("good job saved dab");
      console.log(onlineUsers);
    }
    io.emit("hereTakeYourUser", Object.values(onlineUsers));
  });

  socket.on("SendMessageToEveryone", (message) => {
    const now = new Date();
    const messageObject = {
      id: Date.now(),
      content: message,
      user: onlineUsers[socket.id],
      msgTime: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
    };

    io.emit("RecieveMessage", messageObject);
  });


  socket.on("SendMessageToRoom", (room, message) => {
    const now = new Date();
    const messageObject = {
      id: Date.now(),
      content: message,
      user: onlineUsers[socket.id],
      msgTime: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
    };
    roomChatsMsgs[room] = [...(roomChatsMsgs[room] || []), messageObject];
    io.to(room).emit("RecieveDmMessage", messageObject);
  });


  socket.on("LoadRoom", (room) => {
    console.log(openRooms[room]);
    io.to(socket.id).emit("LoadRoomChat", roomChatsMsgs[room] || [], openRooms[room], room);
  });


  socket.on("JoinRoom", (room) => {
    socket.join(room);
  });
  socket.on("LeaveRoom", (room) => {
    socket.leave(room);
  });


  socket.on("StartChatRoom", (secondUser) => {
    const secondUserSocketID = onlineUsersByUsername[secondUser].socketID;
    console.log(secondUserSocketID);
    
    for (const [roomNumber, usersInRoom] of Object.entries(openRooms)) {
      if (usersInRoom.includes(secondUser) && usersInRoom.includes(onlineUsers[socket.id].username)) {
        console.log("checking for existing room");
        console.log(roomNumber, usersInRoom);
        console.log(roomChatsMsgs[roomNumber]);
        console.log(openRooms[roomNumber]);
        io.to(secondUserSocketID).emit("RoomNumberForUser", onlineUsers[socket.id].username, roomNumber);
        console.log(onlineUsers);
        io.to(socket.id).emit("RoomNumberForUser", secondUser, roomNumber);
        socket.join(roomNumber);
        io.to(socket.id).emit("LoadRoomChat", roomChatsMsgs[roomNumber] || [], openRooms[roomNumber], roomNumber);
        return;
      }
    }
    console.log("creating new room");
    const newChatRoomNumber = ++roomChatsNumber;
    openRooms[newChatRoomNumber] = [onlineUsers[socket.id].username, secondUser];

    io.to(secondUserSocketID).emit("RoomNumberForUser", onlineUsers[socket.id].username, newChatRoomNumber);

    io.to(socket.id).emit("RoomNumberForUser", secondUser, newChatRoomNumber);
    socket.join(newChatRoomNumber);
    io.to(socket.id).emit("LoadRoomChat", roomChatsMsgs[newChatRoomNumber] || [], openRooms[newChatRoomNumber], newChatRoomNumber);
  });
});



app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/users", userRouter);
//app.use('/api/v1/lobby', lobbyRouter);

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
