import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Category } from "../models/category.model.js";

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
