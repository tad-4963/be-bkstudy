import CourseReview from '../Models/CourseReview.js';

const createReview = async (userId, courseId, rating, review) => {
  const existingReview = await CourseReview.findOne( { userId, courseId });
  if (existingReview) {
    return new Error("User already reviewed this course");
  }

  const newReview = new CourseReview({ userId, courseId, rating, review });
  return await newReview.save();
};

const updateReview = async (userId, userRole, reviewId, rating, review) => {
  const existingReview = await CourseReview.findById(reviewId);

  if (!existingReview) {
    return new Error("Review not found");
  }

  if(existingReview.userId.toString() === userId || userRole === "Admin") {
    existingReview.rating = rating;
    existingReview.review = review;
  
    return await existingReview.save();
  }

  return new Error("You are not authorized to update this review");
};

const getReviewsByCourse = async (courseId) => {
  return await CourseReview.find({ courseId }).populate({
    path: 'userId',
    select: 'name _id email',
  });
};

const getReview = async (userId, courseId) => {
  return await CourseReview.findOne({ userId, courseId });
}

const deleteReview = async (reviewId) => {
  return await CourseReview.findByIdAndDelete(reviewId);
};

const getTotalReviews = async () => {
  return await CourseReview.countDocuments();
}

export default {
  createReview,
  updateReview,
  getReviewsByCourse,
  getReview,
  deleteReview,
  getTotalReviews
};
