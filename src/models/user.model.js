import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

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
        // courses: [
        //     {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: "Course"
        //     }
        // ],
        avatar: {
            type: String,
            required: true
        },
        courseProgress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseProgess"
        },
        refreshToken: {
            type: String,
        },
        resetPasswordToken : {
            type : String
        },
        resetPasswordTokenExpiry: {
            type: Date
        },
        // additionalDetails: {
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: "Profile"
        // }
    },
    {timestamps: true}
)

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function (){
    return  jwt.sign(
        {
            _id: this._id,
            email: this.email,
            accountType: this.accountType
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function (){
    return  jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema)