import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Category } from "../models/category.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const createCategory = asyncHandler( async (req, res)=>{
    const {categoryName, description} = req.body
    if(categoryName.trim()==="" || description.trim()===""){
        throw new ApiError(400, "Not proper categoryname or description")
    }

    // check if category already exist
    const category = await Category.findOne({categoryName: categoryName})
    if(category){
        throw new ApiError(400, "category with this name already exist")
    }

    const createdcategory = await Category.create(
        {
            categoryName,
            description
        }
    )

    if(!createdcategory){
        throw new ApiError(500, "Error in creating entry in DB")
    }

    return res.status(200).json(new ApiResponse(200, createdcategory, "category created successfully"))
})

const getAllCategorys = asyncHandler ( async (req, res)=> {
    // 
    const allcategorys = await Category.find({}, {categoryName: true, description: true})

    if(!allcategorys.length){
        throw new ApiError(400, "No category found")
    }

    return res.status(200).json(new ApiResponse(200, allcategorys, "All categorys fetched successfully"))
})

const categoryPageDetails = asyncHandler( async (req, res)=>{
    const {categoryId} = req.params;
    const {page=1, pageSize=10} = req.query
    if(!isValidObjectId(categoryId)){
        throw new ApiError(200, "CategoryId is in valid")
    }

    const category = await Category.findById(categoryId)
    if(!category){
        throw new ApiError(200, "Category not found")
    }
    
    // find the videos
    const skip = parseInt((page-1)*pageSize)
    const videos = await Category.aggregate(
        [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(categoryId)
                }
            },
            {
                $lookup : {
                    from : "Course",
                    localField: "_id",
                    foreignField: "category",
                    as: "course",
                    pipeline: [
                        {
                            $lookup : {
                                from : "User",
                                localField: "instructor",
                                foreignField: "_id",
                                as: "instructor",
                                pipeline: [
                                    {
                                        $project: {
                                            firstName: true,
                                            avatar : true,
                                            lastName: true
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $project: {
                                instructor: {
                                    $first: "$instructor"
                                }
                            }
                        }
                    ]
                }
            },
            {
                $skip: skip
            },
            {
                $limit: parseInt(pageSize)
            }
        ]
    )

    if(!videos.length){
        throw new ApiError(404, "No video for this category")
    }

    return res.status(200).json(new ApiResponse(200, videos, "All categorys fetched successfully"))
})

export {
    createCategory,
    getAllCategorys,
    categoryPageDetails
}