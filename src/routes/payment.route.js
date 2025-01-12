import { Router } from "express";
import {
    capturePayment,
    verifySignature
} from "../controllers/payment.controller.js"
import {isStudent, verifyJWT} from "../middlewares/auth.middleware.js" 

const router = Router()
router.use(verifyJWT)
router.route("/capture-payment/:courseId").post(isStudent, capturePayment)
router.route("/verify-signature").post(verifySignature)

export default router