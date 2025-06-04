import {body} from 'express-validator'
import {User} from "../models/User.js";

const passwordResetConfirmation = [
    body('password').custom((password, { req }) => {
        if(password.trim().length < 6 || password.trim().length > 12) {
            throw new Error('Password must be at least 6 characters and no more than 12');
        }

        const regex = new RegExp(`^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$`)

        if(!regex.test(password)) {
            throw new Error('Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 symbol');
        }

        if(password !== req.body.confirmPassword) {
            throw new Error('Passwords must be equal');
        }

        return true
    }),
    body('token').trim().notEmpty().custom(async (value, { req }) => {
        const user = await User.findOne({resetPasswordToken: value}).select(['_id', 'restorePasswordExpiresAt']);

        if(!user) {
            throw new Error('Such a token does not exist');
        }

        if(user.restorePasswordExpiresAt < Date.now()) {
            throw new Error('This token was expired');
        }

        req.userId = user.id;

        return true;
    })
]

export default passwordResetConfirmation;