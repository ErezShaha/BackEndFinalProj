import express from 'express';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRouter from './routers/userRouter.js';
import http from 'http';
import { Server } from'socket.io';


config();

const app = express();
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
const io = new Server(server, {
    cors: "*",
});



io.on("connection", (socket) => {

    socket.on("SendMessageToEveryone", (message) => {
        const messageObject = {id: Date.now(), content: message};
        io.emit("RecieveMessage", messageObject);
    })


    socket.on("JoinRoom", (room) => {
        socket.join(room);
    });

    socket.on("SendMessageToRoom", (room, message) => {
        const messageObject = {id: Date.now(), content: message};
        io.to(room).emit("RecieveMessage", messageObject);
    });
});










app.use(cors({origin: "http://localhost:5173", credentials: true}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/v1/users', userRouter);
//app.use('/api/v1/chats', chatsRouter);


mongoose.connect(process.env.MONGO_CONNECTION)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Listening on PORT ${PORT}`);
        })
    })
    .catch((err) => {
        console.log(err);
    })















//pre soketim

//     config();

// const app = express();
// const PORT = process.env.PORT || 8080;

// app.use(cors({origin: "http://localhost:5173", credentials: true}));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// app.use('/api/v1/users', userRouter);
// app.use('/api/v1/users', userRouter);


// mongoose.connect(process.env.MONGO_CONNECTION)
//     .then(() => {
//         app.listen(PORT, () => {
//             console.log(`Listening on PORT ${PORT}`);
//         })
//     })
//     .catch((err) => {
//         console.log(err);
//     })
