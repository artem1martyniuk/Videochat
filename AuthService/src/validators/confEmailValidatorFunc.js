import {body} from 'express-validator'
import {User} from "../models/User.js";

const signInValidator = [
    body('code').custom(async (code, { req }) => {
        const userId = req.user.userId;

        if(!userId) {
            throw new Error('User was not found');
        }

        const userData = await User.findById(userId, 'verifyEmailToken verifyEmailExpiresAt')

        if(!userData?.verifyEmailToken || !userData?.verifyEmailExpiresAt) {
            throw new Error('Verification code was not found');
        }

        if(Date.parse(userData.verifyEmailExpiresAt) < Date.now()) {
            throw new Error('Verification code has expired');
        }
        
        console.log(`DB code: ${userData.verifyEmailToken}\nSent code: ${code}`)

        if(userData.verifyEmailToken !== code) {
            throw new Error('Verification codes are not identical');
        }

        return true
    }),
]

export default signInValidator;