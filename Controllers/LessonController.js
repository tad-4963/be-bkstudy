import LessonService from '../Services/LessonService.js';
import CourseService from '../Services/CourseService.js';

/**
 * Tạo bài học mới thuộc một khóa học
 * Yêu cầu: `courseId` trong req.body phải hợp lệ và tồn tại
 */
const createLesson = async (req, res) => {
    try {
        // Kiểm tra khóa học có tồn tại không
        const course = await CourseService.getCourseById(req.body.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Tạo bài học mới
        const lesson = await LessonService.createLesson(req.body);
        return res.status(201).json(lesson);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Lấy thông tin một bài học theo ID
 */
const getLessonById = async (req, res) => {
    const { id } = req.params;
    try {
        const lesson = await LessonService.getLessonById(id);

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        return res.status(200).json(lesson);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Cập nhật thông tin một bài học
 * Dựa trên ID của bài học và dữ liệu trong req.body
 */
const updateLesson = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedLesson = await LessonService.updateLesson(id, req.body);

        if (!updatedLesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        return res.status(200).json(updatedLesson);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Xóa một bài học theo ID
 */
const deleteLesson = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedLesson = await LessonService.deleteLesson(id);

        if (!deletedLesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        return res.status(200).json({ message: 'Lesson deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Lấy danh sách các bài học trong một khóa học
 * Gửi kèm userId và role để áp dụng phân quyền nếu cần
 */
const getLessonsByCourse = async (req, res) => {
    const userId = req?.user?.id;
    const role = req?.user?.role;
    const { courseId } = req.params;
    try {
        const lessons = await LessonService.getLessonsByCourse(userId, role, courseId);
        return res.status(200).json(lessons);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Xuất toàn bộ controller
export default {
    createLesson,
    getLessonById,
    updateLesson,
    deleteLesson,
    getLessonsByCourse,
};
