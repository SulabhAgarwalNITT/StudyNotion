import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {OTP } from "../models/otp.model.js"
import { generate } from "otp-generator"

// OTP while signin
const createOTP = asyncHandler( async (req, res)=>{
    // get  new-email/unregistered email from user
    const {email} = req.body
    if(!email){
        throw new ApiError(400, "Please send email")
    }

    // check if user already exist
    const user = await User.findOne({
        email: email
    })
    if(user){
        throw new ApiError(400, "user with email already exist")
    }

    // generate otp
    const generatedOTP = generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
    })

    // set otp in db
    const otp = await OTP.create(
        {
            email,
            otp: generatedOTP
        }
    )
    if(!otp){
        throw new ApiError(400, "Error in saving otp to database")
    }
    // return response
    return res.status(200).json(new ApiResponse(200, {email: otp.email, _id: otp._id}, "OTP send saved in db"))
})

export {
    createOTP
}