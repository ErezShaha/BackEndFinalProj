import User from "../models/User.js";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
config();


export const signup = async (req, res) => {
    try {
        const user = req.body;

        //checks for missing fields
        if (!user || !user.username || !user.password) {
            return res.status(400).json('User is not valid');
        }

        //finding if there is already a user with the same username
        const userFromDB = await User.findOne({ username: user.username });

        if (userFromDB) {
            return res.status(400).json('Username already taken');
        }

        //hashes the password
        user.password = await bcrypt.hashSync(user.password, 10);
        
        //create the new user in the database
        await User.create(user);

        res.status(201).json('User created successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send(error);
    }
}

export const login = async (req, res) => {
    try {
        const user = req.body;

        //checks for missing fields
        if (!user || !user.username || !user.password) {
            return res.status(400).json('User is not valid');
        }
        //finds the user by username
        const userFromDB = await User.findOne({ username: user.username });

        //check if the password matches
        const isMatchedPassword = await bcrypt.compare(user.password, userFromDB.password);

        if (!userFromDB || !isMatchedPassword) {
            return res.status(404).json({ error: 'Invalid Credentials' });
        }


        //make token
        const token = jwt.sign({username: user.username}, 
            process.env.SECRET_KEY,
            { expiresIn: '10m',  issuer: `http://localhost:${process.env.PORT||8080}` });
        
        //sends the cookie
        res.cookie('jwt', token, { httpOnly: true, maxAge: 900000 }); 
        
        //returns the user
        res.json(userFromDB);

    } catch (err) {
        res.status(500).send(error);
    }
}

export const verifyLogin = async (req, res) => {
    const token = req.cookies.jwt;

    //checks if token is provided
    if (!token) {
        res.status(401).json({error: 'No Token Found'});
    }

    //checks if token matches the secret key and issuer
    const isTokenVerified = jwt.verify(token, process.env.SECRET_KEY, { issuer: `http://localhost:${process.env.PORT||8080}` });

    if (!isTokenVerified) {
        res.status(401).json({error: 'Invalid Token'});
    }

    res.send();
}






















