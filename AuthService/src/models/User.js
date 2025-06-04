import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    firstName: { type: String, required: true},
    lastName: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    avatar: String,
    password: {type: String, required: true},
    isActive: { type: Boolean, default: false },
    verifyEmailToken: String,
    verifyEmailExpiresAt: Date,
    resetPasswordToken: String,
    restorePasswordExpiresAt: Date
}, {timestamps: true});

export const User = model("User", userSchema);

