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

    // check if user already exist
    const user = User.findOne({
        email: email
    })
    if(user){
        throw new ApiError("400", "user with email already exist")
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

    // checking otp is formed or not
    const Otp = await OTP.findById(otp.id).select("-otp")
    if(Otp){
        throw new ApiError(500, "Error in updating OTP in database")
    }

    // return response
    return res.status(400).json(new ApiResponse(200, otp, "OTP send saved in db"))
})