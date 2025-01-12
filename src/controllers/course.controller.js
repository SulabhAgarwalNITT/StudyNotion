import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/course.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { Category } from "../models/category.model.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose, { isValidObjectId, mongo } from "mongoose";

const addCourse = asyncHandler( async(req, res)=>{
    const {courseName, courseDescription, price, whatWillYouLearn, category} = req.body
    const user = req.user
    const thumbnailPath = req.file?.path

    // validate 
    if(!courseName || !courseDescription || !price || !whatWillYouLearn || !category){
        throw new ApiError(400, "All details not provided")
    }

    if(!thumbnailPath){
        throw new ApiError(400, "Thumnail not provided")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailPath)

    if(!isValidObjectId(category)){
        throw new ApiError(200, "Invalid categoryId")
    }

    const categoryDetails = await Category.findById(category)
    if(!categoryDetails){
        throw new ApiError(400, "category Not found")
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
            // category: category
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
                    from: "users" ,
                    localField: "instructor",
                    foreignField: "_id",
                    as: "instructor",
                    pipeline: [
                        { 
                            $project: {
                                firstName:true,
                                lastName: true,
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
                    thumbnail: true,
                    price: true,
                }
            }
        ]
    )

    if(!allcourse.length){
        throw new ApiError(400, "No courses found")
    }

    return res.status(200).json(new ApiResponse(200, allcourse, "Courses found successfully"))
})

const getCourseDetail = asyncHandler( async (req, res)=>{
    const {courseId} = req.params;
    if(!isValidObjectId(courseId)){
        throw new ApiError(400, "courseId is not valid")
    }

    const courseDetail = await Course.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(courseId)
                },
            },
            {
                $lookup : {
                    from: "users" ,
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
                    from: "sections" ,
                    localField: "courseContent",
                    foreignField: "_id",
                    as: "section",
                    pipeline: [
                        {
                            $lookup: {
                                from: "subsections" ,
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

    if(!courseDetail.length){
        throw new ApiError(400, "not course details found ")
    }

    return res.status(200).json(new ApiResponse(200, courseDetail[0], "Course Detail found successfully"))
})

export {
    addCourse,
    getAllCourse,
    getCourseDetail
}