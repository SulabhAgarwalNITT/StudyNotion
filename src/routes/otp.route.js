import { Router } from "express";
import { createOTP } from "../controllers/otp.controller.js";
const router = Router()
router.route("/").post(createOTP)

export default router