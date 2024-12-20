import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        gender : {
            type: String,
        },
        dob: {
            type: String,
        },
        contactNumber: {
            type: String,
            trim: true
        },
        about: {
            type: String,
            trim: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
    },
    {
        timestamps: true
    }
)

export const Profile = mongoose.model("Profile", profileSchema)