import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async(req, res) => {
    const { fullName, email, password} = req.body;
    try {
        if(!fullName || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }
        if(password.length < 6) {
            return res.status(400).json({message: "Password must be at least 6 characters long"});
        }

        const user = await User.findOne({email});
        if(user) {
            return res.status(400).json({message: "User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);


        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        if(newUser) {
            //generate jwt token
            generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });
        } else {
            res.status(400).json({message: "Failed to create user"});
        }

    } catch (error) {
        console.log("Error in signup controller:", error.message);
        res.status(500).json({message: "Server error"});
    }        
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({email});

        if(!user) {
            return res.status(400).json({message: "Invalid credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            return res.status(400).json({message: "Invalid credentials"});
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error in login controller:", error.message);
        res.status(500).json({message: "Internal Server error"});
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0});
        res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.log("Error in logout controller:", error.message);
        res.status(500).json({message: "Internal Server error"});
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, fullName, email } = req.body;
        const userId = req.user._id;
        
        // Prepare update object
        const updateData = {};
        
        // Handle profile picture update if provided
        if (profilePic) {
            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            updateData.profilePic = uploadResponse.secure_url;
        }
        
        // Handle fullName update if provided
        if (fullName) {
            updateData.fullName = fullName;
        }
        
        // Handle email update if provided
        if (email) {
            // Check if email already exists (we want unique emails)
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== userId.toString()) {
                return res.status(400).json({ message: "Email already in use" });
            }
            updateData.email = email;
        }
        
        // If no fields to update, return error
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }
        
        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId, 
            updateData, 
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in updateProfile controller:", error.message);
        res.status(500).json({ message: "Internal Server error" });
    }
};

export const deleteAccount = async (req, res) => {
    try {
      const { password } = req.body;
      const userId = req.user._id;
  
      const user = await User.findById(userId);
      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Invalid password" });
      }
  
      await User.findByIdAndDelete(userId);
  
      res.cookie("jwt", "", { maxAge: 0 });
  
      res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
      console.log("Error in deleteAccount controller:", error.message);
      res.status(500).json({ message: "Internal Server error" });
    }
  };

export const checkAuth = async (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller:", error.message);
        res.status(500).json({message: "Internal Server error"});
    }
};