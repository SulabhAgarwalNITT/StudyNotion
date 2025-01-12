import { Router } from "express";
import {
    createSection,
    updateSection,
    deleteSection
} from "../controllers/section.controller.js"
import {isInstructor, verifyJWT} from "../middlewares/auth.middleware.js" 


const router = Router()
router.use(verifyJWT).use(isInstructor)

router.route("/create/:courseId").post(createSection)
router.route("/:sectionId").patch(updateSection).delete(deleteSection)

export default router