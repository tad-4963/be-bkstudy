import mongoose from 'mongoose';
import QuizLesson from '../Models/QuizModel.js'; // Import QuizLesson model
import RegisterCourseService from './RegisterCourseService.js'; // Import RegisterCourseService nếu cần

// Tạo một quiz mới
const createQuiz = async (data) => {
  let { title, description, questions, order, courseId } = data;

  // Kiểm tra các trường bắt buộc
  if (!title || !description || !order || !courseId || !questions || questions.length === 0) {
    throw new Error('Missing required fields or questions array is empty');
  }

  order = Number.parseInt(order);
  if (isNaN(order)) {
    throw new Error('Invalid order of quiz in course');
  }

  // Kiểm tra nếu quiz với thứ tự này đã tồn tại trong khóa học
  const checkOrderQuiz = await QuizLesson.findOne({ order: order, courseId: courseId });
  if (checkOrderQuiz) {
    throw new Error('Quiz with the same order already exists in this course');
  }

  try {
    // Tạo mới quiz và lưu vào cơ sở dữ liệu
    const quiz = new QuizLesson({
      title,
      description,
      questions,
      order,
      courseId
    });
    await quiz.save();
    return quiz;
  } catch (error) {
    throw new Error('Error creating quiz: ' + error.message);
  }
};

// Lấy quiz theo ID
const getQuizById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid quizId');
  }

  try {
    const quiz = await QuizLesson.findById(id);
    return quiz;
  } catch (error) {
    throw new Error('Error fetching quiz: ' + error.message);
  }
};

// Cập nhật thông tin quiz
const updateQuiz = async (id, data) => {
  let { title, description, questions, order, courseId } = data;

  if (!title || !description || !order || !courseId || !questions || questions.length === 0) {
    throw new Error('Missing required fields or questions array is empty');
  }

  order = Number.parseInt(order);
  if (isNaN(order)) {
    throw new Error('Invalid order of quiz in course');
  }

  try {
    const quiz = await QuizLesson.findByIdAndUpdate(id, {
      title,
      description,
      questions,
      order,
      courseId
    }, { new: true });

    return quiz;
  } catch (error) {
    throw new Error('Error updating quiz: ' + error.message);
  }
};

// Xóa quiz theo ID
const deleteQuiz = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid quizId');
  }

  try {
    const quiz = await QuizLesson.findByIdAndDelete(id);
    return quiz;
  } catch (error) {
    throw new Error('Error deleting quiz: ' + error.message);
  }
};

// Lấy danh sách quiz theo khóa học
const getQuizzesByCourse = async (userId, role, courseId) => {
  try {
    // Nếu người dùng chưa đăng nhập
    if (!userId) {
      // Không lấy các câu hỏi và đáp án nếu người dùng chưa đăng nhập
      const quizzesWithoutQuestions = await QuizLesson.find({ courseId }).select('-questions').sort({ order: 'asc' });
      return quizzesWithoutQuestions;
    }

    // Nếu là Admin, lấy tất cả quiz có câu hỏi và đáp án
    if (role === 'Admin') {
      const quizzesWithQuestions = await QuizLesson.find({ courseId }).sort({ order: 'asc' });
      return quizzesWithQuestions;
    }

    // Nếu người dùng đã đăng nhập và đã đăng ký khóa học
    const registeredCourse = await RegisterCourseService.getRegisteredCourse(userId, courseId);
    if (registeredCourse && registeredCourse?.status == 'Confirmed') {
      const quizzesWithQuestions = await QuizLesson.find({ courseId }).sort({ order: 'asc' });
      return quizzesWithQuestions;
    } else {
      // Nếu chưa đăng ký hoặc chưa xác nhận, chỉ lấy quiz mà không có câu hỏi
      const quizzesWithoutQuestions = await QuizLesson.find({ courseId }).select('-questions').sort({ order: 'asc' });
      return quizzesWithoutQuestions;
    }
  } catch (error) {
    throw new Error('Error fetching quizzes by course: ' + error.message);
  }
};

// Xuất tất cả các phương thức
export default {
  createQuiz,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizzesByCourse
};
