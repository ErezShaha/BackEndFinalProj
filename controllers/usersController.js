import User from "../models/User.js";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import { onlineUsers } from "../app.js";
config();

export const signup = async (req, res) => {
  try {
    const user = req.body;

    //checks for missing fields
    if (!user || !user.username || !user.password) {
      return res.status(400).json({ error: "User is not valid" });
    }

    //finding if there is already a user with the same username
    const userFromDB = await User.findOne({ username: user.username });

    if (userFromDB) {
      return res.status(400).json({ error: "Username already taken" });
    }

    //hashes the password
    user.password = await bcrypt.hashSync(user.password, 10);

    //create the new user in the database
    await User.create(user);

    res.status(201).json({ error: "User created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

export const login = async (req, res) => {
  try {
    const user = req.body;

    //checks for missing fields
    if (!user || !user.username || !user.password) {
      return res.status(400).json({ error: "User is not valid" });
    }

    //finds the user by username
    const userFromDB = await User.findOne({ username: user.username });

    //check if the password matches
    const isMatchedPassword = await bcrypt.compare(
      user.password,
      userFromDB.password
    );
    if (!userFromDB || !isMatchedPassword) {
      return res.status(400).json({ error: "Incorrect Details" });
    }

    // check if the user is already logged in
    if (
      Object.values(onlineUsers).find(
        (onlineUser) => user.username === onlineUser.username
      )
    ) {
      return res.status(400).json({ error: "User is already logged in" });
    }

    //make token
    const token = jwt.sign(
      { username: user.username },
      process.env.SECRET_KEY,
      {
        expiresIn: "30m",
        issuer: `http://localhost:${process.env.PORT || 8080}`,
      }
    );

    //sends the cookie
    res.cookie("jwt", token, { httpOnly: true, maxAge: 900000 });

    //returns the user
    res.send(userFromDB.username);
  } catch (error) {
    res.status(500).send(error);
  }
};

export const logout = async (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    const isTokenVerified = jwt.verify(token, process.env.SECRET_KEY, {
      issuer: `http://localhost:${process.env.PORT || 8080}`,
    });

    if (!isTokenVerified) {
      res.status(404).json({ error: "Token not found" });
    }
    res.clearCookie("jwt");
  }
  return res.send();
};

export const verifyToken = async (req, res) => {
  const token = req.cookies.jwt;

  //checks if token is provided
  if (!token) {
    return res.status(401).json({ error: "No Token Found" });
  }

  //checks if token matches the secret key and issuer
  const isTokenVerified = jwt.verify(token, process.env.SECRET_KEY, {
    issuer: `http://localhost:${process.env.PORT || 8080}`,
  });

  if (!isTokenVerified) {
    return res.status(401).json({ error: "Invalid Token" });
  }

  console.log("verified");
  return res.send(isTokenVerified.username);
};

//brainfuck logout from socket

// if (isTokenVerified) {
//     for(let socketId in onlineUsers){
//         if(onlineUsers[socketId] === isTokenVerified.username){
//             console.log(onlineUsers);
//             console.log(`Socket ${socketId} disconnected from User ${isTokenVerified.username}`);
//             delete onlineUsers[socketId];
//             console.log(onlineUsers);
//         }
//     }
// }
