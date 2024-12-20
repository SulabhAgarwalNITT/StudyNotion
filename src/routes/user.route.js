import { Router } from "express";
import {
    RegisterUser,
    loginUser,
    changePassword,
    resetPasswordToken,
    resetPassword,
    deleteAccount,
    getUserDetails,
    changeAvatar
} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()
router.route("/register").post(RegisterUser)
router.route("/login").post(loginUser)
router.route("/change-password").patch(verifyJWT, changePassword)
router.route("/reset-password-token").post(resetPasswordToken)
router.route("/reset-password").patch(resetPassword)
router.route("/deleteAccount").delete(verifyJWT, deleteAccount)
router.route("/user-details").get(verifyJWT, getUserDetails)
router.route("/change-avatar").patch(upload.single("avatar"), changeAvatar)

export default router