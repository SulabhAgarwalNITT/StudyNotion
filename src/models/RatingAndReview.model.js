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
        }
    },
    {
        timestamps: true
    }
)

export const Rating = mongoose.model("Rating", ratingSchema)