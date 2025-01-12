import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Rating } from "../models/RatingAndReview.model.js";
import mongoose , { isValidObjectId } from "mongoose";
import { Course } from "../models/course.model.js";
import { Subscription } from "../models/subscription.model.js";

const createReview = asyncHandler( async (req, res)=>{
    const user = req.user;
    const {rating, review=""} = req.body;
    const {courseId} = req.params;

    if(!rating){
        throw new ApiError(400, "Rating is not available")
    }

    if(!isValidObjectId(courseId)){
        throw new ApiError(400, "Invalid objectId")
    }

    const course = await Course.findById(courseId)
    if(!course){
        throw new ApiError(400, "Course not found")
    }

    //check if the user have taken course or not
    const isSubscribed = await Subscription.findOne(
        {
            courseId: courseId,
            studentId: user._id
        }
    )
    if(!isSubscribed){
        throw new ApiError(400, "User have not taken this course, hence not authorized for rating")
    }

    // if user already reviewed the course
    const alreadyReviewed = await Rating.findOne({
        owner: user._id,
        course: courseId
    })
    if(alreadyReviewed){
        throw new ApiError(400, "user already reviewed the course")
    }

    const newReview = await Rating.create({
        owner: user._id,
        rating,
        review,
        course: courseId
    })

    if(!newReview){
        throw new ApiError(400, "Error in creating review")
    }

    return res.status(200).status(200, "Review created successfully")
})

const getAverageReview = asyncHandler( async (req, res)=>{
    const {courseId} = req.params;
    if(!isValidObjectId(courseId)){
        throw new ApiError(400, "Invalid objectId")
    }

    const course = await Course.findById(courseId)
    if(!course){
        throw new ApiError(400, "Course not found")
    }

    const avgRating = Rating.aggregate(
        [
            {
                $match: {
                    course : new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group: { 
                    _id: "$course",
                    avgRating: {
                        $avg  : "$rating"
                    }
                }
            },
            {
                $project: {
                    avgRating: true,
                    courseId: true,
                }
            }
        ]
    )

    if(!avgRating.length){
        throw new ApiError(400, "Not rating done till now")
    }

    return res.status(200).json(new ApiResponse(200, avgRating[0], "Course Detail found successfully"))
})

const getAllReviewOnParticularCourse = asyncHandler( async (req, res)=>{
    const {courseId} = req.params;
    if(!isValidObjectId(courseId)){
        throw new ApiError(400, "Invalid objectId")
    }

    const course = await Course.findById(courseId)
    if(!course){
        throw new ApiError(400, "Course not found")
    }

    const allRating = await Rating.aggregate(
        [
            {
                $match: {
                    course : new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $lookup: {
                    from : "users",
                    localField: "owner",
                    foreignField: "_id",
                    as : "owner",
                    pipeline: [
                        {
                            $project:{
                                firstName: true,
                                lastName: true,
                                avatar: true
                            }
                        } 
                    ]
                }
            },
            {
                $addFields : {
                    owner: {
                        $first: "$owner"
                    }
                }
            },
        ]
    )

    if(!allRating.length){
        throw new ApiError(400, "No rating done till now")
    }

    return res.status(200).json(new ApiResponse(200, allRating, "Course Detail found successfully"))
})

export {
    createReview,
    getAverageReview,
    getAllReviewOnParticularCourse
}