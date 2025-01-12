import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Profile } from "../models/profile.model.js";
import { User } from "../models/user.model.js";
import { isValidObjectId } from "mongoose";

const createProfile = asyncHandler( async (req, res)=>{
    const {gender, contactNumber, about="", dob=""} = req.body 
    if(!gender || !contactNumber){
        throw new ApiError(400, "Send proper details")
    }

    const user = req.user
    if(!user){
        throw new ApiError(400, "First login")
    }

    const profile = await Profile.create({
        gender,
        contactNumber,
        owner : user._id,
        about,
        dob
    })

    // const userUpdate = await User.findByIdAndUpdate(
    //     {
    //         _id: user._id
    //     },
    //     {
    //         additionalDetails: profile._id
    //     },
    //     {
    //         new: true
    //     }
    // )

    return res.status(200).json(new ApiResponse(200, profile, "Profile created successfully"))
})

const updateProfile = asyncHandler( async (req, res)=>{
    const {profileId} = req.params;
    const {gender, contactNumber, about="", dob=""} = req.body 
    if(!gender || !contactNumber){
        throw new ApiError(400, "Send proper details")
    }

    const user = req.user
    if(!user){
        throw new ApiError(400, "First login")
    }

    if(!isValidObjectId(profileId)){
        throw new ApiError(400, "Not valid object id")
    }

    const profile = await Profile.findById(profileId)
    if(!profile){
        throw new ApiError(400, "Profile not found in database")
    }

    if(!profile.owner.equals(user._id)){
        throw new ApiError(400, "User is not the owner of profile")
    }

    profile.gender = gender,
    profile.dob = dob,
    profile.contactNumber = contactNumber
    profile.about = about
    await profile.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponse(200, profile, "Profile updated successfully"))
})

export {
    createProfile,
    updateProfile
}
