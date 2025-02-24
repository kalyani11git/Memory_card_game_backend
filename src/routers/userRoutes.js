const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../Middlewares/authMiddleware");


const router = express.Router();


router.post("/signup",async(req,res)=>{
 try{
    const { name, email, password } = req.body;
    // console.log(name);
    
    if (!name || !email || !password ) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ 
        name, 
        email, 
        password: hashedPassword
         // Store the address object in MongoDB
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({ token, user: newUser });
} catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
}

});


router.post("/login",async(req,res)=>{
    try {
        const {email,password} = req.body;
        // console.log(email);
        
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ token, user });
        
    } catch (error) {
        console.error("Error during login:", error); // Log detailed error
        res.status(500).json({ message: "Login failed", error: error.message });
    }
});


router.get("/user/profile", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId; // Extract userId from decoded JWT
        // console.log("userId:", userId);

        // Fetch user data including scores
        const user = await User.findById(userId).select("name email scores");
        // console.log("user:", user);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure scores field is always present in response
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            scores: user.scores || { easy: 0, medium: 0, hard: 0 } // Default scores if missing
        };

        res.status(200).json(userData);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


router.post("/user/update-score", authMiddleware, async (req, res) => {
    try {
      const { level, score } = req.body;
      const userId = req.user.userId;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (!user.scores) {
        user.scores = {}; // Initialize if scores field is missing
      }
  
      // 🔥 Update only if the new score is higher
      if (!user.scores[level] || score > user.scores[level]) {
        user.scores[level] = score;
        await user.save();
        return res.status(200).json({ message: "High score updated", scores: user.scores });
      }
  
      res.status(200).json({ message: "No new high score", scores: user.scores });
    } catch (error) {
      console.error("Error updating score:", error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  });
  
  


module.exports = router;