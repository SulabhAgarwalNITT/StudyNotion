import { Router } from "express";
import {
    addCourse,
    getAllCourse,
    getCourseDetail
} from "../controllers/course.controller.js"
import { verifyJWT, isInstructor } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()
router.use(verifyJWT)
router.route("/add-course").post(isInstructor, upload.single("thumbnail") ,addCourse)
router.route("/all-courses").get(getAllCourse)
router.route("/course-details/:courseId").get(getCourseDetail)

export default router