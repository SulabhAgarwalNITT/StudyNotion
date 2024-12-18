import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Course } from "../models/course.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { Tag } from "../models/tag.model.js";
import { User } from "../models/user.model.js";

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

    await User.findByIdAndUpdate(
        {
            _id: user._id
        },
        {
            $push: {
                courses: course._id
            }
        },
        {
            new : true  
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
                    ratingAndReview: true
                }
            }
        ]
    )
})