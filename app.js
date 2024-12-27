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

export const onlineUsers = {};

io.on("connection", (socket) => {
    console.log(`Socket ${socket.id} Connected`); 


    // LogIn
    socket.on("UserLogin", (username) => {
        onlineUsers[socket.id] = {username: username};
        console.log(`Socket ${socket.id} Loggedin To User ${username}`);
    
        // onlineChange
        console.log(onlineUsers);
        io.emit("hereTakeYourUser", Object.values(onlineUsers));
    });


    // LogOut
    socket.on("UserLogout", () => {
        console.log(`Socket ${socket.id} Loggedout from User ${onlineUsers[socket.id]}`);

        delete onlineUsers[socket.id];
        console.log(`Jobs Done. ${onlineUsers}`);
        
        // onlineChange
        console.log(onlineUsers);
        io.emit("hereTakeYourUser", Object.values(onlineUsers));
    });
    

    // Disconnect
    socket.on("disconnect", () => {
        
        console.log(`Socket ${socket.id} disconnected. Logging out from user ${onlineUsers[socket.id]}`);
        
        delete onlineUsers[socket.id];
        
        // onlineChange
        console.log(onlineUsers);
        io.emit("hereTakeYourUser", Object.values(onlineUsers));
    });
    

    
    socket.on("giveMeMyUser", () => {
        console.log(onlineUsers);
        io.emit("hereTakeYourUser", Object.values(onlineUsers));          
    });

    
    socket.on("lookAtOnlineUsers", () => {
        console.log(onlineUsers);
    });
    
    socket.on("VerifiedRelogin", (username) => {
        if(onlineUsers[socket.id] === undefined) {
            onlineUsers[socket.id] = {username: username};
            console.log("good job saved dab");
            console.log(onlineUsers);
            io.emit("hereTakeYourUser", Object.values(onlineUsers));  
        };
    });


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
//app.use('/api/v1/lobby', lobbyRouter);


mongoose.connect(process.env.MONGO_CONNECTION)
    .then(() => {
        server.listen(PORT, () => {
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


// <Form onSubmit={login}>
//           <Form.Group>
//           <InputGroup className="mb-3">
//         <Form.Control
//         value={user.username}
//         onChange={(e) => setuser({...user, username: e.target.value})}
//           placeholder="Username"
//           aria-label="username"
//           aria-describedby="signIn"
//         />
//       </InputGroup>

//       <InputGroup className="mb-3">
//         <Form.Control
//           value={user.password}
//           onChange={(e) => setuser({...user, password: e.target.value})}
//           onSubmit={login}
//           placeholder="Password"
//           aria-label="password"
//           aria-describedby="signIn"
//         //   משפט טרנרי בטייפ בשביל לעשות שאפשר לראות
//           type='password'
//         />
//       </InputGroup>
//          {/* is href ok? */}
//          </Form.Group>
//       <Button id='signIn' type='submit' variant="info">Sign In</Button>
//       </Form>
// //<Button type='submit' variant="primary" onClick={toggleCard}>Register</Button>
// return (
//     <div>
//       {isCard ? (
//         //sign in
//         <div className = 'centerDiv' >
//           <Card style={{ width: '18rem' }}>
//             <Card.Body>
//               <h1 className='bigTitle'>Bomboclat</h1>
//               <Card.Subtitle className="mb-2 text-muted">Sign In</Card.Subtitle>
//               <Card.Title>
//                 Username
//               </Card.Title>
            
//               <InputGroup className="mb-3">
//                 <Form.Control
//                 value={user.userName}
//                 onChange={(e) => setuser({...user, username: e.target.value})}
//                 placeholder="Username"
//                 aria-label="Username"
//                 aria-describedby="signIn"
//                 />
//                 <br/>
//               </InputGroup>

//               <Card.Title>
//                 Password
//               </Card.Title>
//               <Form onSubmit={login}>
//                 <Form.Group>
//                   <InputGroup className="mb-3">
//                     <Form.Control
//                     value={user.password}
//                     onChange={(e) => setuser({...user, password: e.target.value})}
//                     placeholder="Password"
//                     aria-label="Password"
//                     aria-describedby="signIn"  
//                     type={PassowrdVis}
//                     />
//                     <Button onMouseDown={()=> setPassVIs('text')} onMouseUp={()=> setPassVIs('password')}>o</Button>
//                   </InputGroup> 
              
//                   <Button id='signIn' type='submit' onClick={login}  variant="info" disabled={isDisabled}>Sign In</Button>
//                 </Form.Group>
//               </Form>
//               <br/><br/>
//               <Button type='submit' variant="primary" onClick={toggleCard}>Register</Button>
            
      
//             </Card.Body>
//           </Card>
//         </div>

//       ):(
//         //register
//       <div className='centerDiv'>
//         <Card style={{ width: '18rem' }}>
//           <Card.Body>
//             <h1 className='bigTitle'>Bomboclat</h1>
//             <Card.Subtitle className="mb-2 text-muted">Register</Card.Subtitle>
            
//             <Card.Title>
//               Please enter a username
//             </Card.Title>
//             <Form onSubmit={login}>
//               <Form.Group>
//                 <InputGroup className="mb-3">
//                   <Form.Control
//                   value={userRegister.userName}
//                   onChange={(e) => setuserRegister({...user, username: e.target.value})}
//                   placeholder="Username"
//                   aria-label="Username"
//                   aria-describedby="register"
//                   />
//                   <br/>
//                 </InputGroup>

//                 <Card.Title>
//                   Please enter a password
//                 </Card.Title>

//                 <InputGroup className="mb-3">
//                   <Form.Control
//                   value={user.Password}
//                   onChange={(e) => setuser({...user, password: e.target.value})}
//                   placeholder="Password"
//                   aria-label="Password"
//                   aria-describedby="register"  
//                   type={PassowrdVis}
//                   />
//                   <Button onMouseDown={()=> setPassVIs('text')} onMouseUp={()=> setPassVIs('password')}>o</Button>
//                 </InputGroup>

              
//                 <Button id='register' type='submit' onClick={register} variant="primary">Register</Button>
//               </Form.Group>
//             </Form>
//             <br/><br/>
//             <Button type='submit' onClick={toggleCard}  variant="info">Sign In</Button>
          
        
//           </Card.Body>
//         </Card>
//       </div>
//       )}
//     </div>
//   )
// }

// export default LoginPage

