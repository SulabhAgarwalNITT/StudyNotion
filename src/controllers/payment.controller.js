import { instance } from "../utils/razorpay.js";
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { Course } from "../models/course.model.js";
import { User } from "../models/user.model.js";
import { mailSender } from "../utils/mailsender.js";
import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";

const capturePayment = asyncHandler ( async (req, res)=>{
    const {courseId}= req.params;

    // validate details
    if(!isValidObjectId(courseId)){
        throw new ApiError(400, "Courseid not found")
    }

    const course = Course.findById(courseId);
    if(!course){
        throw new ApiError(400, "Course not found")
    }

    const user = req.user
    if(!user){
        throw new ApiError(400, "First login")
    }

    // if user have already buy that course
    const isSubsribed = Subscription.findOne({
        courseId: courseId,
        studentId: user._id
    })

    if(isSubsribed){
        throw new ApiError(500, 'Student is already subscribed')
    }

    const paymentResponse = await instance.orders.create({
        amount: course.price*100,
        currency: "INR",
        receipt: Math.random(Date.now()).toString(),
        notes: {
            userId: req.user._id,
            courseId: courseId,
        } 
    })

    if(!response){
        throw new ApiError(500, "Unable to create")
    }

    return res.status(200).json(new ApiResponse(200, {
        orderId: paymentResponse.id,
        courseName : course.courseName,
    } , "order created successsfully"))
})


const verifySignature = asyncHandler( async (req, res)=>{
    const webhookSecret = "12345678"
    const signature = req.headers["x-razorpay-signature"]

    const shasum = crypto.createHmac("shac256", webhookSecret)
    shasum.update(JSON.stringify(req.body))
    const digest = shasum.digest("hex")    

    if(signature !== digest){
        throw new ApiError(400, "Payment signature not verified")
    }

    console.log(" Payment is authorised")
    const {userId, courseId} = req.body.payload.payment.entity.notes

    const subscribed = await Subscription.create({
        courseId,
        studentId: userId
    })

    const user = await User.findById(userId)
    // send mail
    const emailResponse = await mailSender(
        user.email, 
        "Congratulation from StudyNotion",
        "You get enrolled in new course"
    )

    return res.status(200).json(new ApiResponse(200, subscribed, "Course added successfully"))
})

export {
    capturePayment,
    verifySignature
}