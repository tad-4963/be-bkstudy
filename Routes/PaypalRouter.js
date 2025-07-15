import express from 'express'
const router = express.Router();
import PaypalController from "../Controllers/PaypalController.js";
import { authMiddleware } from '../middleware/AuthMiddleware.js';


// Route tạo payment
router.post("/create-order", authMiddleware, PaypalController.createOrder);

// Route xác nhận registration
router.post("/capture-order/:registrationId", authMiddleware, PaypalController.captureOrder);

export default router;