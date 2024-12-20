import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        rating: {
            type: Number,
            required: true
        },
        review: {
            type : String,
            trim: true
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }
    },
    {
        timestamps: true
    }
)

export const Rating = mongoose.model("Rating", ratingSchema)