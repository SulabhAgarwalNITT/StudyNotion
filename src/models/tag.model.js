import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
    {
        name: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        description: {
            type: Number,
        },
        course: {
            type : mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }
    },
    {
        timestamps: true
    }
)

export const Tag = mongoose.model("Tag", tagSchema)