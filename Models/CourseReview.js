import mongoose from 'mongoose';

const CourseReviewSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

const CourseReview = mongoose.model('CourseReview', CourseReviewSchema);
export default CourseReview;
