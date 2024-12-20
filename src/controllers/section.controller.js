import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";
import { Course } from "../models/course.model.js";
import { Section } from "../models/section.model.js";

const createSection = asyncHandler( async (req, res)=>{
    const {courseId} = req.params;
    const {sectionName} = req.body
    const user = req.user

    if(!isValidObjectId(courseId)){
        throw new ApiError(401, "CourseId is not valid")
    }

    const course = await Course.findById(courseId)
    if(!course){
        throw new ApiError(401, "Course is not in the db")
    }

    const newSection = await Section.create({
        sectionName,
        owner: user._id
    })

    if(!newSection){
        throw new ApiError(401, "Course is not in the db")
    }

    const updatedCourse = await Course.findByIdAndUpdate(
        {
            _id: courseId
        },
        {
            $push: {
                courseContent: newSection._id
            }
        },
        {
            new: true
        }
    )

    return res.status(200).json(new ApiResponse(200, newSection, "Section created successfully"))
})

const updateSection = asyncHandler( async (req, res)=>{
    const {sectionId} = req.params;
    const {sectionName} = req.body

    if(!isValidObjectId(sectionId)){
        throw new ApiError(400, "sectionId is not valid")
    }

    const section = await Section.findById(sectionId)
    if(!section){
        throw new ApiError(400, "SectionId not exist or error in updating section")
    }

    if(!section.owner.equals(req.user._id)){
        throw new ApiError(400, "User is not the owner of course")
    }

    section.sectionName = sectionName
    await section.save({validateBeforeSave: false})

    return res.status(200).json(new ApiResponse(200, section, "Section updated successfully"))
})

const deleteSection = asyncHandler( async (req, res)=>{
    const {sectionId} = req.params;

    if(!isValidObjectId(sectionId)){
        throw new ApiError(401, "sectionId is not valid")
    }

    const section = await Section.findById(sectionId)
    if(!section){
        throw new ApiError(400, "Section do not exist")
    }

    if(!section.owner.equals(req.user._id)){
        throw new ApiError(400, "User is not the owner of course")
    }

    await section.deleteOne()

    await Course.updateMany(
        {
            courseContent : sectionId
        },
        {
            $pull: {
                courseContent:sectionId
            }
        }
    )

    return res.status(200).json(new ApiResponse(200, {}, "Section deleted successfully"))
})

export {
    createSection,
    updateSection,
    deleteSection
}