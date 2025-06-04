import {body} from 'express-validator'

const signUpValidator = [
    body('email').trim().notEmpty().isEmail().withMessage('Not a valid e-mail address'),
    body('password').custom(password => {
        if(password.trim().length < 6 || password.trim().length > 12) {
            throw new Error('Password must be at least 6 characters and no more than 12');
        }

        const regex = new RegExp(`^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).+$`)

        if(!regex.test(password)) {
            throw new Error('Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 symbol');
        }

        return true
    }),
    body('confirmPassword').trim().notEmpty().custom((value, { req }) => {
        if(value !== req.body.password) {
            throw new Error('Passwords must be equal');
        }

        return true;
    }),
    body('firstName').trim().notEmpty().isLength({min: 2, max: 50}).withMessage('The firstname must be at least 2 and no more than 50 characters'),
    body('lastName').trim().notEmpty().isLength({min: 2, max: 50}).withMessage('The lastname must be at least 2 and no more than 50 characters')
]

export default signUpValidator;