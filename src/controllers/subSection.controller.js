import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Section } from "../models/section.model.js";
import { SubSection } from "../models/subSection.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

const createSubSection = asyncHandler( async (req, res)=>{
    const {sectionId} = req.params;
    const {title, description} = req.body
    const user = req.user
    const videoPath = req.file?.path

    if(!isValidObjectId(sectionId)){
        throw new ApiError(401, "sectionId is not valid")
    }

    if(title.trim()==="" || title.trim()===""){
        throw new ApiError(401, "title or decription not provided")
    }

    const section = await Section.findById(sectionId)
    if(!section){
        throw new ApiError(401, "Section is not in the db")
    }

    if(!videoPath){
        throw new ApiError(401, "Video path is not available")
    }

    const video  = await uploadOnCloudinary(videoPath)

    const newSubSection = await SubSection.create({
        title,
        owner: user._id,
        description,
        duration: video.duration,
        videoUrl: video.url
    })

    if(!newSubSection){
        throw new ApiError(401, "newSubSection is not created db")
    }

    const updatedSection = await Section.findByIdAndUpdate(
        {
            _id: sectionId
        },
        {
            $push: {
                subSection: newSubSection._id
            }
        },
        {
            new: true
        }
    )

    return res.status(200).json(new ApiResponse(200, newSubSection, "Section created successfully"))
})

const updateSubSection = asyncHandler( async (req, res)=>{
    const {subSectionId} = req.params;
    const {title, description} = req.body

    if(!isValidObjectId(subSectionId)){
        throw new ApiError(401, "subSectionId is not valid")
    }

    const subSection = await SubSection.findById(subSectionId)
    if(!subSection){
        throw new ApiError(400, "SectionId not exist or error in updating section")
    }

    if(!subSection.owner.equals(req.user._id)){
        throw new ApiError(400, "User is not the owner of course")
    }

    subSection.title = title
    subSection.description = description

    await subSection.save({validateBeforeSave: false})
    return res.status(200).json(new ApiResponse(200, subSection, "SubSection updated successfully"))
})

const deleteSubSection = asyncHandler( async (req, res)=>{
    const {subSectionId} = req.params;

    if(!isValidObjectId(subSectionId)){
        throw new ApiError(401, "subsectionId is not valid")
    }

    const subSection = await SubSection.findById(subSectionId)
    if(!subSection){
        throw new ApiError(400, "sub-Section not exist or error in updating section")
    }

    if(!subSection.owner.equals(req.user._id)){
        throw new ApiError(400, "User is not the owner of course")
    }

    await subSection.deleteOne()
    await Section.updateMany(
            {
                subSection : subSectionId
            },
            {
                $pull: {
                    subSection :subSectionId
                }
            }
        )
    
    return res.status(200).json(new ApiResponse(200, {}, "Section deleted successfully"))
})

export {
    createSubSection,
    updateSubSection,
    deleteSubSection
}