import QuizService from '../Services/QuizService.js';
import CourseService from '../Services/CourseService.js';

// Tạo quiz mới
const createQuiz = async (req, res) => {
    try {
        const course = await CourseService.getCourseById(req.body.courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const quiz = await QuizService.createQuiz(req.body);
        return res.status(201).json(quiz);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Lấy quiz theo ID
const getQuizById = async (req, res) => {
    const { id } = req.params;
    try {
        const quiz = await QuizService.getQuizById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        return res.status(200).json(quiz);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Cập nhật quiz
const updateQuiz = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedQuiz = await QuizService.updateQuiz(id, req.body);
        if (!updatedQuiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        return res.status(200).json(updatedQuiz);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Xóa quiz
const deleteQuiz = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedQuiz = await QuizService.deleteQuiz(id);
        if (!deletedQuiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        return res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Lấy danh sách quiz theo khóa học (tùy quyền truy cập)
const getQuizzesByCourse = async (req, res) => {
    const userId = req?.user?.id;
    const role = req?.user?.role;
    const { courseId } = req.params;
    try {
        const quizzes = await QuizService.getQuizzesByCourse(userId, role, courseId);
        return res.status(200).json(quizzes);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export default {
    createQuiz,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    getQuizzesByCourse,
};
