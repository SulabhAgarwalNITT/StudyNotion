import mongoose from "mongoose";
import { mailSender } from "../utils/mailsender";
import { asyncHandler } from "../utils/asyncHandler";

const otpSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true
        },
        otp: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
)

const sendVerificationEmail = asyncHandler( async (email, otp)=>{
    try {
        const mailResponse = await mailSender(email, "Verification Email from studynotion", otp)
        console.log("Email sent successfully", mailResponse)
    } catch (error) {
        console.log("error while sending email", error)
    }
})

otpSchema.pre("save", async (next)=>{
    await sendVerificationEmail(this.email, this.otp);
    next()
})

export const OTP = mongoose.model("OTP", otpSchema)