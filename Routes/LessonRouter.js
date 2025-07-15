import express from 'express';
import lessonController from '../Controllers/LessonController.js';
import { authMiddleware, identifyUserMiddleware } from '../middleware/AuthMiddleware.js';
import { adminAuthMiddleware } from '../middleware/AdminAuthMiddleware.js';

const router = express.Router();

router.get('/lessons-by-course/:courseId', identifyUserMiddleware, lessonController.getLessonsByCourse);
router.post('/admin/create', authMiddleware, adminAuthMiddleware, lessonController.createLesson);
router.get('/admin/details/:id', authMiddleware, adminAuthMiddleware, lessonController.getLessonById);
router.put('/admin/update/:id', authMiddleware, adminAuthMiddleware, lessonController.updateLesson);
router.delete('/delete/:id', authMiddleware, adminAuthMiddleware, lessonController.deleteLesson);

export default router;
