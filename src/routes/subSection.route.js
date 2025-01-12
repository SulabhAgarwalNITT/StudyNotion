import { Router } from "express";
import {
    createSubSection,
    updateSubSection,
    deleteSubSection
} from "../controllers/subSection.controller.js"
import {isInstructor, verifyJWT} from "../middlewares/auth.middleware.js" 
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()
router.use(verifyJWT).use(isInstructor)
router.route("/create/:sectionId").post(upload.single("video"), createSubSection)
router.route("/:subSectionId").patch(updateSubSection).delete(deleteSubSection)

export default router