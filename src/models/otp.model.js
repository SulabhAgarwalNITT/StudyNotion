import mongoose from "mongoose";
import { mailSender } from "../utils/mailsender.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true
        },
        otp: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 300, // OTP expires after 5 minutes (300 seconds)
        },
    }
)

const sendVerificationEmail = asyncHandler( async (email, otp)=>{
    try {
        const mailResponse = await mailSender(email, "Verification Email from studynotion", otp)
        console.log("Email sent successfully", mailResponse)
    } catch (error) {
        console.log("error while sending email", error)
        throw error;
    }
})

otpSchema.pre("save", async function(next){
    try {
        await sendVerificationEmail(this.email, this.otp);
        next();
    } catch (error) {
        console.error("Error in pre-save hook:", error);
        next(error); // Pass the error to Mongoose.
    }
})

export const OTP = mongoose.model("OTP", otpSchema)