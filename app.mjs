import "./config.mjs";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import { Listing, User } from "./db.mjs";
import cors from "cors";
import bcrypt from 'bcryptjs';
import session from 'express-session';

mongoose.connect(process.env.DSN);
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: ['http://linserv1.cims.nyu.edu:24452'],
    credentials: true, 
  })
);

app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 86400000 },
}));

//adding protected routes here
const authRequiredPaths = ['/api/current-user'];

//check if the user is authenticated before accessing protected routes
app.use((req, res, next) => {
  if (authRequiredPaths.includes(req.path)) {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  } else {
    next(); // call next() for non-authenticated paths
  }
});


//post a listing
app.post("/api/listings", async (req, res) => {
  console.log("received data:", req.body);
  try {
    const listing = new Listing(req.body);
    const savedListing = await listing.save();
    console.log("saved listing:", savedListing);
    res.status(201).json(savedListing);
  } catch (error) {
    console.error("error saving listing:", error);
    res.status(500).json({ error: "failed to create listing" });
  }
});

//retrieve all listings from database
app.get("/api/listings", async (req, res) => {
  console.log("Getting all listings...");
  const listings = await Listing.find();
  console.log("Found these listings", listings);
  res.status(200).json(listings);
});

//get a specific listing by id
app.get("/api/listings/:postId", async (req, res) => {
  const postId = req.params.postId;
  const listing = await Listing.findById(postId);
  res.json(listing);
});

//handle basic registration
app.post("/api/register", async (req, res) => {
  console.log("user is attempting to register");
  console.log("received data:",req.body); //currently only has the username
  const {username,emailAddress,password}=req.body;

  if (!username || !emailAddress || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  //hash the password
  //store their credentials into the database  
  try{
    const hashedPassword=await bcrypt.hash(password,10);
    const user=new User({
      username:username,
      email:emailAddress,
      passwordHash:hashedPassword,
      createdAt:Date.now()
    });
    const savedUser = await user.save();
    console.log("saved User:", savedUser);
    res.status(201).json(savedUser);
  }
  catch(error){
    console.error("error saving user:", error);
    res.status(500).json({ error: "failed to save user" });
  }
});


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body; 
  console.log("The req body is",req.body);
  //check that both email and password are available
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  console.log("trying to find user now");
  //find user
  try {
    const user = await User.findOne({ email });
    console.log("The user is",user);
    //if user doesn't exist
    if (!user)  {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const passwordsMatch = bcrypt.compareSync(password, user.passwordHash); 

        //if passwords don't match
    if (!passwordsMatch){
      return res.status(401).json({ message: 'Password does not match' });
    }
    //return appropriate message
    console.log("The req.session.user is",req.session.user);
    req.session.user = { id: user._id, username: user.username };
    res.status(200).json({ message: 'Login successful', user: req.session.user });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});


app.post('/api/logout', (req, res) => {
  //destroy session for user
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    //clear the session cookie from the client's browser
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully' });
  });
});


app.get('/api/current-user', (req, res) => {
  if (req.session.user) {
    console.log("Logged-in user:", req.session.user);
    return res.status(200).json({ user: req.session.user });
  } else {
    console.log("No user is logged in.");
    return res.status(401).json({ message: "No user is logged in." });
  }
});


//delete specific listing by id
app.delete("/api/listings/:id", async (req, res) => {
  const listingId = req.params.id;
  await Listing.findByIdAndDelete(listingId);
  res.status(200).json({ message: "Listing deleted successfully" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
