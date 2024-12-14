import mongoose from "mongoose";

const profileSchema = mongoose.Schema(
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
    },
    {
        timestamps: true
    }
)

export const Profile = mongoose.model("Profile", profileSchema)