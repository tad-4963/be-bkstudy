import express from 'express';
import UserController from '../Controllers/UserController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';
import multer from 'multer';
import { adminAuthMiddleware } from '../middleware/AdminAuthMiddleware.js';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.post('/logout', UserController.logoutUser);
router.post('/refresh-token', UserController.refreshUserToken);
router.get('/profile', authMiddleware, UserController.getUserProfile);
router.put('/updateAvatar', authMiddleware, upload.single('avatarFile'), UserController.updateAvatar);
router.put('/update', authMiddleware, UserController.updateUserProfile);
router.get('/admin/get-all', authMiddleware, adminAuthMiddleware, UserController.getUsers);
router.post('/admin/create-user', authMiddleware, adminAuthMiddleware, UserController.createUser);
router.put('/admin/edit-profile', authMiddleware, adminAuthMiddleware, UserController.editUserProfile);
router.delete('/admin/:userId', authMiddleware, adminAuthMiddleware, UserController.deleteUser);
router.get('/admin/search', authMiddleware, adminAuthMiddleware, UserController.searchUsers);
router.post('/forgot-password/:email',UserController.forgotPassword);
router.post('/verify-reset-password-token/:email', UserController.verifyResetPasswordToken);
router.patch('/reset-password', UserController.resetPassword);
router.patch('/change-password', authMiddleware, UserController.changePassword);
router.get('/admin/get-total-users', authMiddleware, adminAuthMiddleware, UserController.getTotalUsers);
export default router;