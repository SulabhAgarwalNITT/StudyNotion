import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            requied: true,
            trim: true
        },
        lastName: {
            type: String,
            requied: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        accountType: {
            type: String,
            required: true,
            enum:["Admin", "Student","Instructor"]
        },
        Courses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course"
            }
        ],
        avatar: {
            type: String,
            required: true
        },
        additionalDetails: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile"
        },
        courseProgress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseProgess"
        },
        refreshToken: {
            type: String,
        }
    },
    {timestamps: true}
)



export const User = mongoose.model("User", userSchema)