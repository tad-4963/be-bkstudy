import mongoose from 'mongoose';
import Lesson from '../Models/LessonModel.js';
import RegisterCourseService from './RegisterCourseService.js';

const createLesson = async (data) => {
    let { title, description, videos, order, courseId } = data;

    if(!title || !description || !order || !courseId) {
        throw new Error('Missing required fields');
    }

    order = Number.parseInt(order);
    if(order === NaN) {
        throw new Error('Invalid order of lesson in course');
    }
    
    const checkOrderLesson = await Lesson.findOne({ order: order, courseId: courseId });

    if(checkOrderLesson) {
        throw new Error('Lesson with the same order already exists in this course');
    }
    
    try {
        const lesson = new Lesson({
            title,
            description,
            videos,
            order,
            courseId
        });
        await lesson.save();
        return lesson;
    } catch (error) {
        throw new Error('Error creating lesson: ' + error.message);
    }
};

const getLessonById = async (id) => {
    if(!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid lessonId');
    }

    try {
        const lesson = await Lesson.findById(id);
        return lesson;
    } catch (error) {
        throw new Error('Error fetching lesson: ' + error.message);
    }
};

const updateLesson = async (id, data) => {
    let { title, description, videos, order, courseId } = data;

    if(!title || !description || !order || !courseId) {
        throw new Error('Missing required fields');
    }

    order = Number.parseInt(order);
    if(order === NaN) {
        throw new Error('Invalid order of lesson in course');
    }

    try {
        const lesson = await Lesson.findByIdAndUpdate(id, {
            title,
            description,
            videos,
            order,
            courseId
        }, { new: true });

        return lesson;
    } catch (error) {
        throw new Error('Error updating lesson: ' + error.message);
    }
};

const deleteLesson = async (id) => {
    if(!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error('Invalid lessonId');
    }

    try {
        const lesson = await Lesson.findByIdAndDelete(id);
        return lesson;
    } catch (error) {
        throw new Error('Error deleting lesson: ' + error.message);
    }
};

const getLessonsByCourse = async (userId, role, courseId) => {
    try {
        //Not sign-in
        if(!userId) {
            const lessonWithoutVideos = await Lesson.find({ courseId }).select('-videos.url').sort({ order: 'asc' });
            return lessonWithoutVideos;
        }

        //Admin
        if(role === 'Admin') {
            const lessonWithVideos = await Lesson.find({ courseId }).sort({ order: 'asc'});
            return lessonWithVideos;
        }

        //Sign-in
        const registeredCourse = await RegisterCourseService.getRegisteredCourse(userId, courseId);
        if(registeredCourse && registeredCourse?.status == 'Confirmed') {
            const lessonWithVideos = await Lesson.find({ courseId }).sort({ order: 'asc'});
            return lessonWithVideos;
        }
        else {
            const lessonWithoutVideos = await Lesson.find({ courseId }).select('-videos.url').sort({ order: 'asc' });
            return lessonWithoutVideos;
        }
    }
    catch (error) {
        throw new Error('Error fetching lessons by course: ' + error.message);
    }
}

export default {
    createLesson,
    getLessonById,
    updateLesson,
    deleteLesson,
    getLessonsByCourse
};
