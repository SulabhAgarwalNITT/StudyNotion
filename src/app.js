import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { ApiError } from "./utils/ApiError.js";
const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGN,
    credentials : true
}))

app.use(express.json({limit: "50kb"})) // agar json file aayegi toh
app.use(express.urlencoded({extended: true, limit: "16kb"})) // for data in url 
app.use(express.static("public"))
app.use(cookieParser())

// importind routes
import userRouter from "./routes/user.route.js"
import courseRouter from "./routes/course.route.js"
import profileRouter from "./routes/profile.route.js"
import categoryRouter from "./routes/category.route.js"
import otpRouter from "./routes/otp.route.js"
import paymentRouter from "./routes/payment.route.js"
import ratingRouter from "./routes/RatingAndReview.route.js"
import sectionRouter from "./routes/section.route.js"
import subSectionRouter from "./routes/subSection.route.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/course", courseRouter)
app.use("/api/v1/profile", profileRouter)
app.use("/api/v1/category", categoryRouter)
app.use("/api/v1/otp", otpRouter)
app.use("/api/v1/payment", paymentRouter)
app.use("/api/v1/RatingAndReview", ratingRouter)
app.use("/api/v1/section", sectionRouter)
app.use("/api/v1/subSection", subSectionRouter)

app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statuscode).json({
            success: err.success,
            message: err.message,
            errors: err.errors,
        });
    }

    // Fallback for other unexpected errors
    console.error(err); // Log the full error for debugging
    return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
    });
}); 

export {app}