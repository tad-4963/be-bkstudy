import CourseReviewService from '../Services/CourseReviewService.js';
import CourseReview from '../Models/CourseReview.js';
import RegisterCourseService from '../Services/RegisterCourseService.js';

/**
 * Tạo đánh giá cho một khóa học
 * Chỉ cho phép người dùng đã đăng nhập
 */
const createReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const { courseId, rating, review } = req.body;
    const userId = req.user.id;

    // TODO: Có thể bổ sung logic xác nhận người dùng đã học xong khóa học trước khi cho phép đánh giá
    // const confirmed = await CourseService.isCourseConfirmed(userId, courseId);
    // if (!confirmed) {
    //   return res.status(403).json({ message: 'You must complete the course before leaving a review.' });
    // }

    const newReview = await CourseReviewService.createReview(userId, courseId, rating, review);
    return res.status(201).json({ message: 'Review created successfully', review: newReview });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating review', error: error.message });
  }
};

/**
 * Cập nhật đánh giá
 * Người dùng chỉ được phép sửa đánh giá của chính mình
 * Admin có thể sửa bất kỳ đánh giá nào
 */
const updateReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const { rating, review } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    const reviewId = req.params.id;

    const updatedReview = await CourseReviewService.updateReview(userId, userRole, reviewId, rating, review);
    return res.status(200).json({ message: 'Review updated successfully', review: updatedReview });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating review', error: error.message });
  }
};

/**
 * Lấy tất cả đánh giá theo ID khóa học
 */
const getReviewsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const reviews = await CourseReviewService.getReviewsByCourse(courseId);
    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
};

/**
 * Xóa đánh giá
 * Người dùng chỉ được xóa đánh giá của chính họ, Admin có thể xóa tất cả
 */
const deleteReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not logged in' });
    }

    const reviewId = req.params.id;
    const userId = req.user.id;

    const existingReview = await CourseReview.findById(reviewId);
    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Chỉ xóa nếu là chủ sở hữu hoặc admin
    if (existingReview.userId.toString() !== userId && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'You are not authorized to delete this review' });
    }

    const deletedReview = await CourseReviewService.deleteReview(reviewId);
    return res.status(200).json({ message: 'Review deleted successfully', review: deletedReview });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
};

/**
 * Lấy tổng số lượng đánh giá hiện có trong hệ thống
 */
const getTotalReviews = async (req, res) => {
  try {
    const totalReviews = await CourseReviewService.getTotalReviews();
    return res.status(200).json({ totalReviews });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching total totalReviews', error: error.message });
  }
};

// Xuất tất cả controller
export default {
  createReview,
  updateReview,
  getReviewsByCourse,
  deleteReview,
  getTotalReviews,
};
