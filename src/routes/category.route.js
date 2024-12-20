import { Router } from "express";
import {
    createCategory,
    getAllCategorys,
    categoryPageDetails
} from "../controllers/category.controller.js"
import {isAdmin, verifyJWT} from "../middlewares/auth.middleware.js" 

const router = Router()
router.use(verifyJWT)
router.route("/create-category").post(isAdmin, createCategory)
router.route("/get-all").get(getAllCategorys)
router.route("/:categoryId").get(categoryPageDetails)

export default router