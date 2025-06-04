import {body} from 'express-validator'
import {User} from "../models/User.js";

const passwordResetSendEmail = [
    body('email').custom(async (email) => {
        const user = await User.findOne({email});
        if(!user) {
            throw new Error('User with such email does not exist');
        }

        return true;
    })
]

export default passwordResetSendEmail;