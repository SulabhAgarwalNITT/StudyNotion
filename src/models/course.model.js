import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        courseName: {
            type: String,
            required: true
        },
        courseDescription : {
            type: String,
            required: true
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        whatWillYouLearn: {
            type: String,
            required: true
        },
        courseContent: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Section"
            }
        ],
        ratingAndReview: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Rating"
        },
        price : {
            type: Number,
            required: true
        },
        thumbnail : {
            type: String
        },
        tag: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tag"
        },
        StudentEnrolled: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ]
    },
    {
        timestamps: true
    }
)

export const Course = mongoose.model("Course", courseSchema)