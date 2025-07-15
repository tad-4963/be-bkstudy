import express from 'express';
import CourseReviewController from '../Controllers/CourseReviewController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';
import { adminAuthMiddleware } from '../middleware/AdminAuthMiddleware.js';

const router = express.Router();

router.post('/create', authMiddleware, CourseReviewController.createReview);
router.put('/update/:id', authMiddleware, CourseReviewController.updateReview);
router.get('/get-by-course/:courseId', CourseReviewController.getReviewsByCourse);
router.delete('/delete/:id', authMiddleware, CourseReviewController.deleteReview);
router.get('/admin/get-total-reviews', authMiddleware, adminAuthMiddleware, CourseReviewController.getTotalReviews);

export default router;
