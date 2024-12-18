import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tag } from "../models/tag.model.js";

const createTag = asyncHandler( async (req, res)=>{
    const {tagName, description} = req.body
    if(tagName.trim()==="" || description.trim()===""){
        throw new ApiError(400, "Not proper tagname or description")
    }

    // check if tag already exist
    const tag = await Tag.findOne({tagName: tagName})
    if(tag){
        throw new ApiError(400, "Tag with this name already exist")
    }

    const createdTag = await Tag.create(
        {
            tagName,
            description
        }
    )

    if(!createdTag){
        throw new ApiError(500, "Error in creating entry in DB")
    }

    return res.status(200).json(new ApiResponse(200, createdTag, "Tag created successfully"))
})

const getAllTags = asyncHandler ( async (req, res)=> {
    // 
    const allTags = await Tag.find({}, {tagName: true, description: true})

    if(!allTags.length){
        throw new ApiError(400, "No tag found")
    }

    return res.status(200).json(new ApiResponse(200, allTags, "All tags fetched successfully"))
})
