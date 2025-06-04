import {body} from 'express-validator'
import {User} from "../models/User.js";
import bcryptjs from "bcryptjs";

const signInValidator = [
    body('email').trim().notEmpty().isEmail().withMessage('Not a valid e-mail address'),
    body('password').custom(async (password, { req }) => {
        console.log("HERERE1")
        const email = req.body?.email;
        if(!email) {
            throw new Error('Not a valid e-mail address')
        }
        console.log("HERERE2")
        const user = await User.findOne({email}).select(['email', 'password']);

        if(!user) {
            throw new Error('Incorrect email or password');
        }
        console.log(`HERERE3 pass: ${password} pass2: ${user.password}`);

        let isEqual;

        try{
            isEqual = await bcryptjs.compare(password, user.password);
        } catch(err) {
            console.log(err);
        }

        if(!isEqual) {
            throw new Error('Incorrect email or password');
        }
        console.log("HERERE4")
        req.userId = user._id;

        return true
    }),
]

export default signInValidator;