import express from 'express';
import quizController from '../Controllers/QuizController.js';
import { authMiddleware, identifyUserMiddleware } from '../middleware/AuthMiddleware.js';
import { adminAuthMiddleware } from '../middleware/AdminAuthMiddleware.js';

const router = express.Router();

// Lấy danh sách quiz theo khóa học (tùy thuộc vào quyền người dùng)
router.get('/quizzes-by-course/:courseId', identifyUserMiddleware, quizController.getQuizzesByCourse);

// Admin thao tác tạo / xem chi tiết / cập nhật / xóa quiz
router.post('/admin/create', authMiddleware, adminAuthMiddleware, quizController.createQuiz);
router.get('/admin/details/:id', authMiddleware, adminAuthMiddleware, quizController.getQuizById);
router.put('/admin/update/:id', authMiddleware, adminAuthMiddleware, quizController.updateQuiz);
router.delete('/delete/:id', authMiddleware, adminAuthMiddleware, quizController.deleteQuiz);

export default router;
