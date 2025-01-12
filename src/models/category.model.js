import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            required : true,
            unique: true
        },
        description: {
            type: String,
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