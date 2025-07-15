import bcrypt from "bcrypt";
import User from "../Models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
} from "./TokenService.js";
import mongoose from "mongoose";
import CourseReview from "../Models/CourseReview.js";
import RegisterCourseModel from "../Models/RegisterCourseModel.js";
import { sendEmailResetPassword } from "./EmailService.js"
import otpGenerator from 'otp-generator';
import Profile from "../Models/Profile.js";

const register = async (userName, email, password) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
  if (existingUser) {
    throw new Error("User already exists with this username or email");
  }

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);  //number: số lượng vòng lặp (rounds) để tạo salt và thực hiện quá trình hashing.
    const user = new User({
      userName,
      email,
      passwordHash: hashedPassword,
    });
    await user.save();
    return {
      userName,
      email,
    };
  } catch (error) {
    throw new Error("Registration failed: " + error.message);
  }
};

const loginUserName = async (userName, password) => {
  try {
    const user = await User.findOne({ userName }).select("+passwordHash");
    if (!user) throw new Error("User not found");

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) throw new Error("Incorrect password");

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const { passwordHash, ...safeUser } = user.toObject();
    return { accessToken, refreshToken, user: safeUser};
  } catch (error) {
    throw new Error("Login failed: " + error.message);
  }
};

const refreshToken = async (refreshToken) => {
  try {
    const decoded = validateRefreshToken(refreshToken);
    if (!decoded) throw new Error("Invalid refresh token");

    const user = await User.findById(decoded.id);
    if (!user) throw new Error("User not found");

    const newAccessToken = generateAccessToken(user);

    return { accessToken: newAccessToken };
  } catch (error) {
    throw new Error("Token refresh failed: " + error.message);
  }
};

const getUserProfile = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");

    const profile = await Profile.findOne({ userId: id });

    return {
      userName: user.userName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      profile: profile || {}, // nếu chưa có profile, trả về object rỗng
    };
  } catch (error) {
    throw new Error("Error retrieving user profile");
  }
};

const updateAvatar = async (id, avatarUrl) => {
  try {
    await User.findByIdAndUpdate(id, {
      avatarUrl,
    });
  } catch (error) {
    throw new Error("Error updating avatar");
  }
};

const updateUserProfile = async (id, newInfo) => {
  try {
    // Cập nhật profile
    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: id },
      {
        fullName: newInfo.fullName,
        phone: newInfo.phone,
        birthday: newInfo.birthday,
        address: newInfo.address,
      },
      { upsert: true, new: true } // nếu chưa có profile thì tạo mới
    );

    return updatedProfile;
  } catch (error) {
    throw new Error("Error updating user profile");
  }
};


const getUsers = async () => {
  try {
    return await User.find();
  } catch (error) {
    throw new Error("Error retrieving users: " + error.message);
  }
};

const deleteUser = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await CourseReview.deleteMany({ userId: userId }, { session });
    await RegisterCourseModel.deleteMany({ userId: userId }, { session });

    const deletedUser = await User.findByIdAndDelete(userId, { session });

    await session.commitTransaction();
    session.endSession();

    if (!deletedUser) {
      throw new Error("User not found");
    }

    return { message: "User deleted successfully" };
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw new Error("Error deleting user: " + error.message);
  }
};

const createUser = async (userName, email, name = "", password, role) => {
  if (!userName) {
    throw new Error("Username is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  const existingUser = await User.findOne({ $or: [{ userName }, { email }] });
  if (existingUser) {
    throw new Error("User already exists with this username or email");
  }

  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters long");
  }

  if (!role || !["User", "Admin"].includes(role)) {
    throw new Error("Invalid role");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      userName,
      email,
      name,
      passwordHash: hashedPassword,
      role,
    });
    await User.create(user);
    return {
      userName: user.userName,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
    };
  } catch (error) {
    throw new Error("Failed to create admin: " + error.message);
  }
};

const editUserProfile = async (userId, { name, role }) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }
  if (!role || !["User", "Admin"].includes(role)) {
    throw new Error("Invalid role");
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        role,
      },
      {
        new: true,
      }
    );

    return updatedUser;
  } catch (error) {
    throw new Error("Error updating user profile: " + error.message);
  }
};

const searchUsers = async (query) => {
  const { userName, name, email, role } = query;
  const queryObject = {};

  if (userName) queryObject.userName = new RegExp(userName, "i");
  if (name) queryObject.name = new RegExp(name, "i");
  if (email) queryObject.email = new RegExp(email, "i");
  if (role) queryObject.role = role;

  try {
    const users = await User.find(queryObject);
    return users;
  } catch (error) {
    throw new Error("Error searching users:" + error.message);
  }
};

const forgotPassword = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user) return;

    const resetPasswordOTP = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    user.resetPasswordToken = resetPasswordOTP;
    user.resetPasswordExpiresIn = Date.now() + 5 * 60 * 1000;
    await sendEmailResetPassword(email, resetPasswordOTP);

    await user.save();
  } catch (error) {
    console.error("Error while saving user:", error);
    throw new Error("Cannot create token!");
  }
};

const verifyResetPasswordToken = async (email, token) => {
  try {
    const user = await User.findOne({ email, resetPasswordToken: token });
    if (!user) return false;
    if (Date.now() > new Date(user.resetPasswordExpiresIn).getTime())
      return false;
    return true;
  } catch (error) {
    throw new Error("Token is invalid!");
  }
};

const resetPassword = async (email, token, password) => {
  const user = await User.findOne({ email, resetPasswordToken: token });
  if (!user) throw new Error("Reset password failed!");
  if (Date.now() > new Date(user.resetPasswordExpiresIn).getTime())
    throw new Error("OTP is expired!");

  if(password.length < 6) {
    throw new Error("The password is at least 6 characters!");
  }

  user.passwordHash = bcrypt.hashSync(password, 10);
  user.resetPasswordToken = null;
  user.resetPasswordExpiresIn = null;
  await user.save();
};

const changePassword = async (userId, currentPassword, newPassword) => {
  if(!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw new Error("Change password failed!");
  
  const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);
  if(!isValidPassword) throw new Error("Incorrect password");

  if(newPassword.length < 6) {
    throw new Error("The password is at least 6 characters!");
  }

  user.passwordHash = bcrypt.hashSync(newPassword, 10);
  
  try {
    await user.save();
  }
  catch(error) {
    throw new Error("Change password failed" );
  }
};

const getTotalUsers = async () => {
  try {
    const totalUsers = await User.countDocuments();
    return totalUsers;
  } catch (error) {
    throw new Error("Error getting total users: " + error.message);
  }
}

export default {
  register,
  loginUserName,
  refreshToken,
  getUserProfile,
  updateAvatar,
  updateUserProfile,
  getUsers,
  deleteUser,
  createUser,
  editUserProfile,
  searchUsers,
  forgotPassword,
  verifyResetPasswordToken,
  resetPassword,
  changePassword,
  getTotalUsers,
};
