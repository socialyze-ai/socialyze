const express = require("express")
const router = express.Router();
const bcrypt = require("bcrypt");
const {User} = require("../models");
const {Channel} = require("../models");
const {SessionTable} = require("../models").Session;
const { Session } = require("express-session");

const { getChannelToShow} = require('../service/UserService'); // Import the functions

// API endpoint for user registration (signup)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password){
    return res.status(400).json({message:"Need to provide email and password."})
  }
  // Check if the user already exists 
  const user = await User.findOne({ where: { email } });
  if (user) {
    if (!bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: "Incorrect password" });
    }
    // Store user data in the session
    user.setDataValue('password', null);
    req.session.authenticated = true
    req.session.user =  user ;
    
    return res.status(200).json({ message: "User already exists. Logging In" , userDetails: user });
  }

  // Hashing the password before storing it
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Store the user data
  const newUser = await User.create({ userName: "", name: "", email: email, password: hashedPassword , phoneNumber:"", profilePic:""});

  // Set the user in session variable
  newUser.setDataValue('password', null);
  req.session.authenticated = true
  req.session.user = newUser;  

  res.status(200).json({ message: "User registered successfully", userDetails: newUser });
});

// API endpoint to check if the user is logged in
router.get("/test", (req, res) => {
  console.log("Test Url")
  res.status(200)
});

router.get("/isLoggedIn", async (req, res) => {
  console.log('Session Data:', req.session);
  let user = req.session.user;
  if (user) {
    user.sessionId = req.sessionID;
    res.json({ loggedIn: true, userDetails: user });
  } else {
    // const sessinId = req.cookies['connect.sid'];
    // console.log(sessinId)
    // const user = await SessionTable.findOne({ where: { session_id:sessinId } });
    // console.log(user)
    res.json({ loggedIn: false });
  }
});

router.get("/channels", async (req, res) => {

  let userId = req.session.user.id;
  let channels = []
  const channelRow = await Channel.findAll({ where: { userId: userId } });
  channelRow.forEach((channel) => {
    channels.push(getChannelToShow(channel.channelName, channel.accessInfo))
  });
  res.json(channels);
})

// API endpoint for user logout
router.get("/logout", (req, res) => {
  console.log("Here")
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.sendStatus(500);
    } else {
      delete req.session;
      delete res.locals.session;
      res.json({ message: "Logout successful" });
    }
  });
});
module.exports = router