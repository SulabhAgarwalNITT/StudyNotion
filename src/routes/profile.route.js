import { Router } from "express";
import {
    createProfile,
    updateProfile
} from "../controllers/profile.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)
router.route("/create").post(createProfile)
router.route("/:profileId").patch(updateProfile)

export default router