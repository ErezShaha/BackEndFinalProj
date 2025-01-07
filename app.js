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
  socket.join(socket.id);
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
    socket.rooms.forEach((room) => {
        if(room !== socket.id){
            socket.leave(room);
        }});
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
            }}
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
  
  socket.on("CheckLoggedin", (username) => {
      if (!onlineUsers[socket.id]) {
          onlineUsers[socket.id] = { username: username };
          onlineUsersByUsername[username] = { socketID: socket.id };
          console.log("good job saved dab");
          console.log(onlineUsers);
        }
        io.emit("hereTakeYourUser", Object.values(onlineUsers));
    });
    
    socket.on("giveMeMyUser", () => {
    console.log(onlineUsers);
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
    console.log("sending msg to" + openRooms[room]);
    io.to(room).emit("RecieveDmMessage", messageObject);


    const currentRoom = io.sockets.adapter.rooms.get(room);
    openRooms[room].forEach((user) => {
        if(!user !== onlineUsers[socket.id] && !currentRoom.has(onlineUsersByUsername[user].socketID)){
            io.to(onlineUsersByUsername[user].socketID).emit("MsgNotif", onlineUsers[socket.id].username);
        };
    });
  });


  socket.on("StartGameRoom", (room) => {
    socket.rooms.forEach((room) => {
      if(room !== socket.id){
          socket.leave(room);
      }});
    socket.join(room);
    const [firstUser, secondUser] = openRooms[room];
    if(io.rooms[room].includes(onlineUsersByUsername[firstUser].socketID) && io.rooms[room].includes(onlineUsersByUsername[secondUser].socketID)){
      io.to(socket.id).emit("BothAreHereWooHoo");
    };
  });
  
  socket.on("JoinAndLoadRoom", (room) => {
    socket.rooms.forEach((room) => {
      if(room !== socket.id){
          socket.leave(room);
      }});
    socket.join(room);
    io.to(socket.id).emit("LoadRoomChat", roomChatsMsgs[room] || [], openRooms[room], room);

  });

  
  socket.on("JoinRoom", (room) => {
    socket.join(room);
  });
  socket.on("LeaveRoom", (room) => {
    socket.leave(room);
  });


  socket.on("StartChatRoom", (secondUser) => {
    const firstUser = onlineUsers[socket.id].username;
    const secondUserSocketID = onlineUsersByUsername[secondUser].socketID
    
    const roomNumber = searchOrCreateRoom(firstUser, secondUser);

    io.to(socket.id).emit("RoomNumberForUser", secondUser, roomNumber);
    io.to(secondUserSocketID).emit("RoomNumberForUser", firstUser, roomNumber);

    socket.join(roomNumber);
    io.to(socket.id).emit("LoadRoomChat", roomChatsMsgs[roomNumber] || [], openRooms[roomNumber], roomNumber);
  });



  socket.on("InviteUserToGame", (secondUser) => {
    const firstUser = onlineUsers[socket.id].username;
    const secondUserSocketID = onlineUsersByUsername[secondUser].socketID
    const roomNumber = searchOrCreateRoom(firstUser, secondUser);

    io.to(socket.id).emit("RoomNumberForUser", secondUser, roomNumber);
    io.to(secondUserSocketID).emit("RoomNumberForUser", firstUser, roomNumber);

    io.to(secondUserSocketID).emit("GameNotif", firstUser);

    socket.rooms.forEach((room) => {
        if(room !== socket.id){
            socket.leave(room);
        }});
    socket.join(roomNumber);

    io.to(socket.id).emit("GoWaitInGameRoom", roomNumber);
    socket.emit("UserIsIngame", firstUser, secondUser);
  })

  socket.on("JoinGameRoom", (room, secondUser) => {
    socket.rooms.forEach((room) => {
        if(room !== socket.id){
            socket.leave(room);
        }});
    socket.join(roomNumber);

    io.to(onlineUsersByUsername[secondUser].socketID).emit("GameNotif", firstUser);

    io.to(socket.id).emit("GoWaitInGameRoom", room);
    socket.emit("UserIsIngame", firstUser, secondUser);
  });
});







const searchOrCreateRoom = (firstUsername, secondUsername) => {
    
    for (const [roomNumber, usersInRoom] of Object.entries(openRooms)) {
      if (usersInRoom.includes(secondUsername) && usersInRoom.includes(firstUsername)) {
        console.log("existing room found: " + roomNumber);
        
        return roomNumber;
      }
    }
    const newChatRoomNumber = ++roomChatsNumber;
    console.log("new room was created: " + newChatRoomNumber);
    openRooms[newChatRoomNumber] = [firstUsername, secondUsername];

    return newChatRoomNumber;
}






















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



// import { useEffect, useState } from "react";
// import Button from "react-bootstrap/Button";
// import Card from "react-bootstrap/Card";
// import ButtonGroup from "react-bootstrap/ButtonGroup";
// import Form from "react-bootstrap/Form";
// import InputGroup from "react-bootstrap/InputGroup";
// import { CardBody } from "react-bootstrap";
// import HomePage from "../pages/HomePage";
// import "../styles/OnlineUsers.css";
// import { socket } from "../utils/socket";
// import { useGlobalContext } from "../contexts/GlobalContext";


// // http://localhost:5173/

// const OnlineUsers = ({ user }) => {
//   const { mainUser } = useGlobalContext();
//   const [room, setRoom] = useState();
//   const [msgNotif, setMsgNotif] = useState(false);
//   const [gameNotif, setGameNotif] = useState(false);
//   const [busyUser, setBusyUser] = useState(false);


//   const startChatRoom = () => {
//     console.log("StartChatRoom");
//     socket.emit("StartChatRoom", user.username);
//   };

//   const openChat = () => {
//     console.log("openChat");
//     setMsgNotif(false);
//     socket.emit("JoinAndLoadRoom", room);
//   };


//   const inviteToGame = () => {
//     console.log("inviting User To Game");
//     socket.emit("InviteUserToGame", user.username);
//   }
  
//   const joinGame = () => {
//     console.log("joinGame");
//     socket.emit("JoinGameRoom", room, user.username);
//   }


//   useEffect(() => {
//     socket.on("RoomNumberForUser", (username, roomNumber) => {
//       console.log("RoomNumberForUser");
//       console.log(username, roomNumber);
//       if (user.username === username) {
//         console.log(roomNumber);
//         setRoom(roomNumber);
//       }
//     });

//     socket.on("UserIsIngame", (busyUser, secondBusyUser) => {
//       if (user.username === busyUser && mainUser.username !== secondBusyUser) {
//         setBusyUser(true);
//       }
//     })

//     socket.on("MsgNotif", (sendingUser) => {
//       if (sendingUser === user.username) {
//         setMsgNotif(true);
//     }})

//     socket.on("GameNotif", (sendingUser) => {
//       if (sendingUser === user.username) {
//         setGameNotif(true);
//       }
//     })
//   }, []);

//   return (
//     <Card className="userCard">
//       <CardBody>
//         <li>
//           <span>{user.username}</span>
//           <Button variant="warning" onClick={room ? openChat : startChatRoom}>
//             {room ? "openChats" : "startChatRooms"}
//           </Button>
//           {msgNotif ? <div>aigool</div> : null}

//           <Button variant="danger" onClick={busyUser ? disabled=true : (room ? joinGame : inviteToGame)}>
//             {busyUser ? "In A Game" : (gameNotif ? "Join A Game" : "Invite To A Game")}
//             </Button>
//           {gameNotif ? <div>aigool</div> : null}
//         </li>
//       </CardBody>
//     </Card>
//   );
// };

// export default OnlineUsers;

// socket.on("GoWaitInGameRoom", (room) => {
//     console.log(`I go sit in the conrner (room: ${room}) and wait for my friend :)`);
//     navigate(`/game/${room}`);
//   })
  