import mongoose from 'mongoose';

const LessonSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    videos: [
        {
            title: { type: String, required: true },
            url: { type: String, required: true },
            duration: { type: String, required: true }
        }
    ],
    //STT trong course
    order: {
        type: Number,
        required: true
    },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
},{
    timestamps: true
});

const Lesson = mongoose.model('Lesson', LessonSchema);
export default Lesson;