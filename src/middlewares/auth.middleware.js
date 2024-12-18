import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/user.model";
dotenv.config();


const verifyJWT = asyncHandler ( async (req, res, next)=> {
    try {
        const accessToken = req.cookie.accessToken || req.header("Authorization").replace("Bearer ", "");
        if(!accessToken){
            throw new ApiError(400, "Access Token not found")
        }
    
        const decodeToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_EXPIRY)
        const user = await User.findById(decodeToken._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(200, "User not found, invalid accessToken")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(400, error.message || "accesstoken not available")
    }
})

const isStudent = asyncHandler ( async (req, res, next) => {
    const accountType = req.user?.accountType
    if(!accountType){
        throw new ApiError(500, "Not able to find account type")
    }

    if(accountType !== "Student"){
        throw new ApiError(500, "Account type is not student, this particluar routes are for students only")
    }

    next(); 
})

const isInstructor = asyncHandler ( async (req, res, next) => {
    const accountType = req.user?.accountType
    if(!accountType){
        throw new ApiError(500, "Not able to find account type")
    }

    if(accountType !== "Instructor"){
        throw new ApiError(500, "Account type is not Instructor, this particluar routes are for Instructor only")
    }

    next(); 
})

const isAdmin = asyncHandler ( async (req, res, next) => {
    const accountType = req.user?.accountType
    if(!accountType){
        throw new ApiError(500, "Not able to find account type")
    }

    if(accountType !== "Admin"){
        throw new ApiError(500, "Account type is not Instructor, this particluar routes are for Instructor only")
    }

    next(); 
})

export {
    verifyJWT,
    isStudent,
    isInstructor,
    isAdmin
}
