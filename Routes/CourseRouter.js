import express from 'express';
import courseController from '../Controllers/CourseController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';
import { adminAuthMiddleware } from '../middleware/AdminAuthMiddleware.js';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/get-courses', courseController.getCourses);
router.get('/detail/url/:urlSlug', courseController.getCourseByUrlSlug);
router.post('/create-many', authMiddleware, courseController.createCourseMany);
router.get('/my-courses', authMiddleware, courseController.getConfirmedCoursesForUser)
router.post('/admin/create', authMiddleware, adminAuthMiddleware, upload.single('image'), courseController.createCourse);
router.get('/admin/course/:courseId', authMiddleware, adminAuthMiddleware, courseController.getCourseById);
router.patch('/admin/:courseId', authMiddleware, adminAuthMiddleware, upload.single('image'), courseController.updateCourse);
router.delete('/admin/:courseId', authMiddleware, adminAuthMiddleware, courseController.deleteCourse);
router.get('/admin/:courseId/registered-users', authMiddleware, adminAuthMiddleware, courseController.getRegisteredUsers);
router.get('/admin/get-total-courses', authMiddleware, adminAuthMiddleware, courseController.getTotalCourses);

export default router;
