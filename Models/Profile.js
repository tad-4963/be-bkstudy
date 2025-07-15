import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        default: null
    },
    phone: {
        type: String,
        default: null
    },
    birthday: {
        type: String,
        default: null
    },
    address: {
        type: String,
        default: null
    },
}, { timestamps: true });

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;
