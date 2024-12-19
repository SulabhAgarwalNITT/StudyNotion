import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/course.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { Tag } from "../models/category.model.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { isValidObjectId } from "mongoose";

const addCourse = asyncHandler( async(req, res)=>{
    const {courseName, courseDescription, price, whatWillYouLearn, tag} = req.body
    const user = req.user
    const thumbnailPath = req.file?.path

    // validate 
    if(!courseName || !courseDescription || !price || !whatWillYouLearn){
        throw new ApiError(400, "All details not provided")
    }

    if(!thumbnailPath){
        throw new ApiError(400, "Thumnail not provided")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailPath)
    const tagDetails = await Tag.findById(tag)
    if(!tagDetails){
        throw new ApiError(400, "Tag Not found")
    }
    // create
    const course = await Course.create(
        {
            courseName,
            courseDescription,
            price,
            instructor: user._id,
            whatWillYouLearn,
            thumbnail: thumbnail.url,
            tag: tag
        }
    )

    // await User.findByIdAndUpdate(
    //     {
    //         _id: user._id
    //     },
    //     {
    //         $push: {
    //             courses: course._id
    //         }
    //     },
    //     {
    //         new : true  
    //     }
    // )

    await Subscription.create(
        {
            courseId: course._id,
            studentId: user._id,
        }
    )

    return res.status(200).json(new ApiResponse(200, course, "new Course created successfullty"))
})

const getAllCourse =  asyncHandler( async (req, res)=>{
    const allcourse = await Course.aggregate(
        [
            {
                $match: {}
            },
            {
                $lookup : {
                    from: "User" ,
                    localField: "instructor",
                    foreignField: "_id",
                    as: "instructor",
                    pipeline: [
                        { 
                            $project: {
                                firstName:true,
                                avatar: true,
                                _id: true
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    instructor: {
                        $first: "$instructor"
                    }
                }
            },
            {
                $project: {
                    courseName: true,
                    courseDescription: true,
                    instructor: true,
                    ratingAndReview: true,
                    thumbnail: true,
                    ratingAndReview: true,
                    price: true,
                }
            }
        ]
    )
})

const getCourseDetail = asyncHandler( async (req, res)=>{
    const {courseId} = req.params;
    if(!isValidObjectId(courseId)){
        throw new ApiError(400, "courseId is not valid")
    }

    const courseDetail = Course.aggregate(
        [
            {
                $match: {
                    _id: courseId
                },
            },
            {
                $lookup : {
                    from: "User" ,
                    localField: "instructor",
                    foreignField: "_id",
                    as: "instructor",
                    pipeline: [
                        { 
                            $project: {
                                firstName:true,
                                avatar: true,
                                _id: true
                            }
                        }
                    ]
                }
            },
            {
                $lookup : {
                    from: "Section" ,
                    localField: "courseContent",
                    foreignField: "_id",
                    as: "section",
                    pipeline: [
                        {
                            $lookup: {
                                from: "SubSection" ,
                                localField: "subSection",
                                foreignField: "_id",
                                as: "subSection",
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    instructor: {
                        $first: "$instructor"
                    }
                }
            }
        ]
    )


})

