import mongoose from "mongoose";
import RegisterCourseModel from "../Models/RegisterCourseModel.js";

const getAllRegistrations = async () => {
  try {
    return await RegisterCourseModel.find()
      .populate("userId", "_id userName email name")
      .populate("courseId", "name")
      .sort({ createdAt: "descending"});
  } catch (error) {
    throw new Error("Error fetching registrations: " + error.message);
  }
};

const updateRegistrationStatus = async (id, status) => {
  if(!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid registration id");
  }

  try {
    const registration = await RegisterCourseModel.findById(id);
    if (!registration) throw new Error("Registration not found");

    registration.status = status;

    return await registration.save();
  } catch (error) {
    throw new Error("Error updating registration status: " + error.message);
  }
};

const createRegistration = async (userId, courseId, course) => {
  try {
    const existingRegistration = await RegisterCourseModel.findOne({
      userId,
      courseId,
    });
    if (existingRegistration && ["Pending", "Confirmed"].includes(existingRegistration.status)) throw new Error("Registration already exists");
    
    let registration = null;
    if(course?.price === 0 || course?.discountPrice === 0) {
      registration = new RegisterCourseModel({ userId, courseId, status: "Confirmed" });
    }
    else {
      registration = new RegisterCourseModel({ userId, courseId });
    }
    return await registration.save();
  } catch (error) {
    throw new Error("Error creating registration: " + error.message);
  }
};

const getRegisteredCourse = async (userId, courseId) => {
  try {
    return (await RegisterCourseModel.find({ userId, courseId }).sort({ updatedAt: "descending"})).at(0);
  } catch (error) {
    throw new Error("Error fetching registration: " + error.message);
  }
};

const getRegisteredCourseById = async (registerId) => {
  try {
    return await RegisterCourseModel.findById(registerId);
  } catch (error) {
    throw new Error("Error fetching registration: " + error.message);
  }
};

const getConfirmedCoursesForUser = async (userId) => {
  try {
    const confirmedCourses = await RegisterCourseModel.find({
      userId,
      status: "Confirmed",
    }).select("courseId createdAt");

    // console.log("confirmedCourses", confirmedCourses);
    // Trả về mảng object chứa courseId và thời điểm đăng ký
    const result = confirmedCourses.map((item) => ({
      courseId: item.courseId,
      registeredAt: item.createdAt,
    }));

    return result;
  } catch (error) {
    throw new Error("Error fetching registrations of user: " + error.message);
  }
};

const getRegisteredUsers = async (courseId) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new Error("Invalid courseId");
  }

  const users = await RegisterCourseModel.find({ courseId }).populate('userId', 'id userName email name');
  return users;
};

const getTotalRegistrations = async () => {
  try {
    return await RegisterCourseModel.countDocuments();
  } catch (error) {
    throw new Error("Error fetching total registrations: " + error.message);
  }
}

export default {
  getAllRegistrations,
  updateRegistrationStatus,
  createRegistration,
  getRegisteredCourse,
  getConfirmedCoursesForUser,
  getRegisteredUsers,
  getRegisteredCourseById,
  getTotalRegistrations,
};
