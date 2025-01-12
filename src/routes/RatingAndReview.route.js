import { Router } from "express";
import {
    createReview,
    getAverageReview,
    getAllReviewOnParticularCourse
} from '../controllers/RatingAndReview.controller.js'
import { verifyJWT, isStudent } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)
router.route("/create/:courseId").post(isStudent, createReview)
router.route("/get-average-review/:courseId").get(getAverageReview)
router.route("/c/:courseId").get(getAllReviewOnParticularCourse)

export default router