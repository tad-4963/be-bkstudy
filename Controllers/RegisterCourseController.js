import CourseService from '../Services/CourseService.js';
import RegisterCourseService from '../Services/RegisterCourseService.js';

/**
 * Lấy tất cả đăng ký khóa học (admin)
 */
const getAllRegistrations = async (req, res) => {
    try {
        const registrations = await RegisterCourseService.getAllRegistrations();
        return res.status(200).json(registrations);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Cập nhật trạng thái đăng ký (admin)
 * @param status - chỉ cho phép "Confirmed" hoặc "Cancelled"
 */
const updateRegistrationStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Kiểm tra trạng thái hợp lệ
    if (!['Confirmed', 'Cancelled'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const updatedRegistration = await RegisterCourseService.updateRegistrationStatus(id, status);
        return res.status(200).json(updatedRegistration);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Tạo mới một đăng ký khóa học (user)
 */
const createRegistration = async (req, res) => {
    const userId = req.user.id;
    const { courseId } = req.body;

    // Kiểm tra người dùng hợp lệ
    if (!userId) return res.status(401).json({ message: 'User does not exist' });

    try {
        // Kiểm tra khóa học tồn tại
        const course = await CourseService.getCourseById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Tạo đăng ký khóa học
        const registration = await RegisterCourseService.createRegistration(userId, courseId, course);
        return res.status(201).json(registration);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Lấy thông tin đăng ký khóa học của người dùng hiện tại (user)
 */
const getRegisteredCourse = async (req, res) => {
    const userId = req.user.id;
    const { courseId } = req.params;

    if (!userId) return res.status(401).json({ message: 'User does not exist' });

    try {
        const registration = await RegisterCourseService.getRegisteredCourse(userId, courseId);
        if (!registration) return res.status(404).json({ message: 'Registration not found' });
        return res.status(200).json(registration);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Lấy tổng số lượt đăng ký (cho dashboard, thống kê, admin)
 */
const getTotalRegistrations = async (req, res) => {
    try {
        const totalRegistrations = await RegisterCourseService.getTotalRegistrations();
        return res.status(200).json({ totalRegistrations });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Export controller
export default {
    getAllRegistrations,
    updateRegistrationStatus,
    createRegistration,
    getRegisteredCourse,
    getTotalRegistrations,
};
