import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Profile } from "../models/profile.model.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { OTP } from "../models/otp.model.js"
import { mailSender } from "../utils/mailsender.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"
import dotenv from "dotenv";
dotenv.config();

const generateAccessAndRefreshToken = async (userId) =>{
    try {
        const user = await User.findById(userId)
        if(!user){
            throw new ApiError(400, "User do not found")
        }
    
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "error in generating refresh and access token")
    }
}

const RegisterUser = asyncHandler( async (req, res)=>{
    const {firstName, lastName, email, password, confirmPassword, accountType, otp} = req.body
    console.log(req.body)
    if(firstName.trim()===""){
        throw new ApiError(400, "First Name is not correct")  
    }

    // validate the details
    if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
        throw new ApiError(400, "Fill all the details properly")
    }

    if(password !== confirmPassword){
        throw new ApiError(400, "Password does not match, Please try again")

    }

    // check user in db
    const existingUser = await User.findOne({email})
    if(existingUser){
        throw new ApiError(400, "user alredy exist with this email")
    }

    // check for the otp 
    const checkOtp = await OTP.findOne({email}).sort({createdAt: -1}).limit(1)
    console.log(checkOtp)
    if(!checkOtp){
        throw new ApiError(400, "OTP not found in db")
    }

    if(otp !== checkOtp.otp){
        throw new ApiError(400, "OTP do not match")
    }

    // make entry in db
    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        accountType,
        // contactNumber,
        avatar: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    if(!createdUser){
        throw new ApiError(500, "Error in creating the user")
    }

    return res.status(200).json(new ApiResponse(200, {
            _id: createdUser._id,
            accountType: createdUser.accountType,
            firstName: createdUser.firstName,
            lastName: createdUser.lastName,
            email: createdUser.email,
            contactNumber: createdUser.contactNumber
        }, 
            "User registered successfully"))
}) 

const loginUser = asyncHandler( async (req, res) => {
    const {email, password} = req.body

    // validate
    if(email.trim() === ""){
        throw new ApiError(400, "email is a valid email")
    }

    // check if user exist or not
    const user = await User.findOne({email})
    if(!user){
        throw new ApiError(400, "user with this email does not exist, Please sign up")
    }

    // check if password is correct or not
    const validatePassword = await user.isPasswordCorrect(password)
    if(!validatePassword){
        throw new ApiError(400, "Password is not correct, Please try again")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    if(!accessToken || !refreshToken){
        throw new ApiError(500, "Error in generating access and refersh token")
    }

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    if(!loggedInUser){
        throw new ApiError(500, "Failed in login, try again later")
    }

    const option = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(new ApiResponse(200, {user: user._id, accessToken, refreshToken}, "User logged in successfully"))
})

const changePassword = asyncHandler ( async (req, res) => {
    const {oldPassword, newPassword, confirmPassword} = req.body
    // validate
    if(oldPassword.trim() === "" || newPassword.trim() === "" || confirmPassword.trim()===""){
        throw new ApiError(400, "wrong entry provided, Please give a valid entry")
    }

    if(newPassword !== confirmPassword){
        throw new ApiError(400, "new password not match with confirm password")
    }

    // check old password
    const user = await User.findById(req.user._id)

    const isCorrectOldPassword = await user.isPasswordCorrect(oldPassword)
    if(!isCorrectOldPassword){
        throw new ApiError(400, "Old password is not correct")
    }

    // give new password
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponse(200, {_id: user._id} ,  "Password Updated Successfully"))
})

const changeAvatar = asyncHandler( async (req, res)=>{
    const user = req.user
    const avatarPath = req.file?.path

    if(!avatarPath){
        throw new ApiError(400, "Pass user avatar")
    }

    const avatar = await uploadOnCloudinary(avatarPath)
    if(!avatar){
        throw new ApiError(400, "Pass user avatar")
    }

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
            avatar: avatar.url
        },
        {
            new :true
        }
    )
    if(!updatedUser){
        throw new ApiError(500, "Error in updating user")
    }

    return res.status(200).json(200, {_id: updatedUser._id, avatar: updatedUser.avatar}, "avatar changed successfully")
})

const resetPasswordToken = asyncHandler( async (req, res)=>{
    // get email from user
    const {email}= req.body;
    if(email.trim()=== ''){
        throw new ApiError(401, "Properly write email")
    }

    // verify user with email exist or not
    const user = User.findOne({email});
    if(!user){
        throw new ApiError(401, "User with email doesn't exist")
    }

    // generate resetPassword Token
    const token = crypto.randomUUID();

    // save the details in usermodel to verify it later
    const updatedDetails = await User.findByIdAndUpdate(
        {
            email: email
        },
        {
            resetPasswordToken: token,
            resetPasswordTokenExpiry: Date.now() + 5*60*1000
        },
        {new : true}
    )

    // Send verification email
    const url = `https://localhost:3000/update-password/${token}`
    await mailSender(email, 
                    "Reset Password link is provided valid for only 5 minutes", 
                    `Password reset link - ${url}`
    )

    return res.status(200).json(new ApiResponse(200, {userId: updatedDetails._id, email: updatedDetails.email}, "Link send successfully"))
})

const resetPassword = asyncHandler( async (req, res) => {
    // get token from body
    const {password, confirmPassword, token} = req.body;

    // validation
    if(password !== confirmPassword){
        throw new ApiError(400, "Password and confirm Password do not match")
    }

    if(token.trim() === ""){
        throw new ApiError(400, "Token not found")
    }

    // check if same token exist in user resetpassword or not
    const user = User.findOne({resetPasswordToken: token})

    if(!user){
        throw new ApiError(400, "Invalid token")
    }

    // if time exceed
    if(Date.now() > user.resetPasswordTokenExpiry ){
        throw new ApiError(400, "Time limit exceed, Please generate another link")
    }

    // change password
    user.password = password
    await user.save({validateBeforeSave: false})

    return res.status(200).json(200, {email: user.email, userId: user._id}, "Password reset successfully")
})

const deleteAccount = asyncHandler( async (req, res)=>{
    const user = req.user
    if(!user){
        throw new ApiError(400, "First login")
    }

    const profile = await Profile.findOne({owner: user._id})
    if(profile){
        await profile.deleteOne()
    }

    await User.findByIdAndDelete(user._id)

    return res.status(200).json(new ApiResponse(200, {}, "Account deleted successfully"))
})

const getUserDetails = asyncHandler ( async (req, res)=>{
    const user = req.user;
    const userDetails = User.aggregate(
        [
            {
                $match: {
                    _id: user._id
                },
            },
            {
                $lookup : {
                    from: "Profile",
                    localField: "additionalDetails",
                    foreignField: "owner",
                    as: "additionalDetails"
                }
            },
            {
                $addFields: {
                    additionalDetails: {
                        $first: "$additionalDetails"
                    }
                }
            },
            {
                $project: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    accountType: true,
                    avatar: true,
                    additionalDetails: true,          
                }
            }
        ]
    )

    if(!userDetails.length){
        throw new ApiError(404, "No user details found")
    }

    return res.status(200).json(new ApiResponse(200, userDetails[0], "User details fetched successfully"))
})

export {
    RegisterUser,
    loginUser,
    changePassword,
    resetPasswordToken,
    resetPassword,
    deleteAccount,
    getUserDetails,
    changeAvatar
}