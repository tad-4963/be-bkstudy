import mongoose from 'mongoose';

const QuizLessonSchema = new mongoose.Schema({
 title: { type: String, required: true },
description: { type: String, required: true },

  questions: [
    {
      question: { type: String, required: true },
      options: [{ type: String, required: true }], // Danh sách đáp án
      correctAnswer: { type: Number, required: true }, // Chỉ số đáp án đúng
    }
  ],

  // Mỗi bài quiz có thứ tự trong khóa học giống như bài học video
  order: { type: Number, required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

}, {
  timestamps: true
});

const QuizLesson = mongoose.model('QuizLesson', QuizLessonSchema);
export default QuizLesson;