import UserRouters from './UserRouter.js'
import CourseRouters from './CourseRouter.js'
import CourseReviewRouters from './CourseReviewRouter.js'
import RegisterCourseRouter from './RegisterCourseRouter.js'
import LessonRouter from './LessonRouter.js'
import PaypalRouter from './PaypalRouter.js'
import QuizRouter from './QuizRouter.js'

const routes = (app) => {
    app.use('/api/user', UserRouters);
    app.use('/api/course', CourseRouters);
    app.use('/api/course-review', CourseReviewRouters);
    app.use('/api/register-course', RegisterCourseRouter);
    app.use('/api/lesson', LessonRouter);
    app.use('/api/quiz', QuizRouter);
    app.use('/api/paypal', PaypalRouter);
}

export default routes;