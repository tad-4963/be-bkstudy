// Import các service liên quan đến người dùng và upload file
import UserService from '../Services/UserService.js';
import CloudinaryService from '../Services/CloudinaryService.js';

/**
 * Đăng ký tài khoản mới
 */
const registerUser = async (req, res) => {
    try {
        const { userName, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const user = await UserService.register(userName, email, password);
        return res.status(201).json(user);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Đăng nhập bằng userName và password
 * Trả về accessToken và refreshToken (lưu refresh token trong cookie)
 */
const loginUser = async (req, res) => {
    try {
        const { userName, password } = req.body;
        const { accessToken, refreshToken,user } = await UserService.loginUserName(userName, password);

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
        });

        return res.status(200).json({ accessToken,user, });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Đăng xuất (xóa cookie refresh token)
 */
const logoutUser = (req, res) => {
    try {
        res.clearCookie('refresh_token');
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

/**
 * Tạo access token mới từ refresh token
 */
const refreshUserToken = async (req, res) => {
    try {
        const token = req.cookies.refresh_token;
        const newAccessToken = await UserService.refreshToken(token);
        return res.status(200).json(newAccessToken);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Lấy thông tin người dùng hiện tại
 */
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({ message: 'User does not exist' });
        }

        const userData = await UserService.getUserProfile(userId);

        if (!userData) {
            return res.status(404).json({ message: 'User profile not found' });
        }

        return res.status(200).json(userData);
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


/**
 * Lấy danh sách tất cả người dùng (cho admin)
 */
const getUsers = async (req, res) => {
    try {
        const users = await UserService.getUsers();
        return res.status(200).json({ users });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Cập nhật ảnh đại diện người dùng (upload lên Cloudinary)
 */
const updateAvatar = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) return res.status(401).json({ message: 'User does not exist' });

        const avatarFile = req.file;
        const fileUrl = await CloudinaryService.uploadFile(avatarFile);
        await UserService.updateAvatar(userId, fileUrl);

        return res.status(200).json({ avatarUrl: fileUrl });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Xóa người dùng theo ID
 */
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        const result = await UserService.deleteUser(userId);
        return res.status(200).json({ ...result, userId });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Cập nhật thông tin profile người dùng hiện tại
 */
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) return res.status(401).json({ message: 'User does not exist' });

        const { fullName, phone, birthday, address } = req.body;

        // Gọi service để update Profile thay vì User
        const updatedProfile = await UserService.updateUserProfile(userId, {
            fullName,
            phone,
            birthday,
            address
        });

        return res.status(200).json({ profile: updatedProfile });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ message: error.message });
    }
};


/**
 * Tạo người dùng mới (chức năng cho admin)
 */
const createUser = async (req, res) => {
    const { userName, email, name, password, role } = req.body;
    try {
        const newUser = await UserService.createUser(userName, email, name, password, role);
        return res.status(201).json({ message: 'User created successfully', newUser });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Chỉnh sửa thông tin người dùng (dùng cho admin)
 */
const editUserProfile = async (req, res) => {
    const userId = req.body._id;
    if (!userId) return res.status(400).json({ message: 'User ID is required' });

    const { name, role } = req.body;

    try {
        const updatedUser = await UserService.editUserProfile(userId, { name, role });
        return res.status(200).json({
            message: 'User updated successfully',
            user: updatedUser
        });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Tìm kiếm người dùng theo điều kiện (query string)
 */
const searchUsers = async (req, res) => {
    const query = req.query;
    try {
        const users = await UserService.searchUsers(query);
        return res.status(200).json({ users });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Quên mật khẩu - gửi OTP về email người dùng
 */
const forgotPassword = async (req, res) => {
    try {
        const email = req.params.email;
        const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        const ischeckEmail = regex.test(email);

        if (!email || !ischeckEmail) {
            return res.status(404).json({ message: "Email is invalid!" });
        }

        await UserService.forgotPassword(email);
        return res.status(200).json({
            message: "Mã xác nhận đã gửi về email của bạn. Vui lòng kiểm tra hộp thư đến và xác nhận mã!"
        });
    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
};

/**
 * Xác minh mã OTP để reset mật khẩu
 */
const verifyResetPasswordToken = async (req, res) => {
    try {
        const { email } = req.params;
        const token = req.body.OTP;
        const tokenRegex = /^\d{6}$/;

        if (!email || !token || !tokenRegex.test(token)) {
            return res.status(400).json({ message: "Token không hợp lệ!" });
        }

        const verify = await UserService.verifyResetPasswordToken(email, token);
        if (!verify) {
            return res.status(400).json({ message: "OTP không hợp lệ!" });
        }

        return res.status(200).json({ message: "OTP hợp lệ!" });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Đặt lại mật khẩu mới sau khi xác minh OTP
 */
const resetPassword = async (req, res) => {
    try {
        const { email, verify_code: token, password } = req.body;

        if (!password || !email || !token) {
            return res.status(400).json({ message: "Thiếu thông tin cần thiết!" });
        }

        await UserService.resetPassword(email, token, password);
        return res.status(200).json({ message: "Change password successfully!" });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Đổi mật khẩu từ tài khoản đang đăng nhập
 */
const changePassword = async (req, res) => {
    const userId = req.user.id;
    if (!userId) return res.status(404).json({ message: "User ID is required" });

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password or new password is required!" });
    }

    try {
        await UserService.changePassword(userId, currentPassword, newPassword);
        return res.status(200).json({ message: "Change password successfully!" });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

/**
 * Đếm tổng số người dùng trong hệ thống (cho admin dashboard)
 */
const getTotalUsers = async (req, res) => {
    try {
        const totalUsers = await UserService.getTotalUsers();
        return res.status(200).json({ totalUsers });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Xuất tất cả controller
export default {
    registerUser,
    loginUser,
    logoutUser,
    refreshUserToken,
    getUserProfile,
    getUsers,
    updateAvatar,
    deleteUser,
    updateUserProfile,
    createUser,
    editUserProfile,
    searchUsers,
    forgotPassword,
    verifyResetPasswordToken,
    resetPassword,
    changePassword,
    getTotalUsers,
};
