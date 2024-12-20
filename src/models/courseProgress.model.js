import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema(
    {
        courseId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        },
        completedVideo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SubSection"
            }
        ]
    },
    {
        timestamps: true
    }
)

export const CourseProgess = mongoose.model("CourseProgess", courseProgressSchema)