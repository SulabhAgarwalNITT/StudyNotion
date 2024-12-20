import { Router } from "express";
import {
    createReview,
    getAverageReview,
    getAllReviewOnParticularCourse
} from '../controllers/RatingAndReview.controller.js'
import { verifyJWT, isStudent } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)
router.route("/create-review").post(isStudent, createReview)
router.route("/get-average-review").get(getAverageReview)
router.route("/c/:courseId").get(getAllReviewOnParticularCourse)

export default router