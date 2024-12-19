import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        categoryName: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        description: {
            type: Number,
        },
        // course: {
        //     type : mongoose.Schema.Types.ObjectId,
        //     ref: "Course"
        // }
    },
    {
        timestamps: true
    }
)

export const Category = mongoose.model("Category", categorySchema)